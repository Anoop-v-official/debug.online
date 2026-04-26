use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::{ClientConfig, DigitallySignedStruct, RootCertStore, SignatureScheme};
use serde::Serialize;
use std::sync::Arc;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;
use tokio_rustls::TlsConnector;
use x509_parser::prelude::*;

#[derive(Serialize)]
pub struct SslInfo {
    pub subject: String,
    pub issuer: String,
    #[serde(rename = "validFrom")]
    pub valid_from: String,
    #[serde(rename = "validTo")]
    pub valid_to: String,
    #[serde(rename = "daysRemaining")]
    pub days_remaining: i64,
    #[serde(rename = "altNames")]
    pub alt_names: Vec<String>,
    pub protocol: Option<String>,
}

#[derive(Debug)]
struct AcceptAll;

impl ServerCertVerifier for AcceptAll {
    fn verify_server_cert(
        &self,
        _end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &ServerName<'_>,
        _ocsp_response: &[u8],
        _now: UnixTime,
    ) -> Result<ServerCertVerified, rustls::Error> {
        Ok(ServerCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        Ok(HandshakeSignatureValid::assertion())
    }

    fn verify_tls13_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        Ok(HandshakeSignatureValid::assertion())
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        vec![
            SignatureScheme::RSA_PKCS1_SHA256,
            SignatureScheme::RSA_PKCS1_SHA384,
            SignatureScheme::RSA_PKCS1_SHA512,
            SignatureScheme::ECDSA_NISTP256_SHA256,
            SignatureScheme::ECDSA_NISTP384_SHA384,
            SignatureScheme::RSA_PSS_SHA256,
            SignatureScheme::RSA_PSS_SHA384,
            SignatureScheme::RSA_PSS_SHA512,
            SignatureScheme::ED25519,
        ]
    }
}

fn valid_host(host: &str) -> bool {
    !host.is_empty()
        && host.len() <= 253
        && host
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.')
        && host.contains('.')
}

fn fmt_name(name: &X509Name) -> String {
    if let Some(cn) = name.iter_common_name().next().and_then(|c| c.as_str().ok()) {
        return cn.to_string();
    }
    if let Some(o) = name.iter_organization().next().and_then(|o| o.as_str().ok()) {
        return o.to_string();
    }
    name.to_string()
}

#[tauri::command]
pub async fn ssl_check(host: String) -> Result<SslInfo, String> {
    let host = host.trim().to_ascii_lowercase();
    if !valid_host(&host) {
        return Err("Invalid hostname".into());
    }

    let mut roots = RootCertStore::empty();
    roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());

    let mut config = ClientConfig::builder()
        .with_root_certificates(roots)
        .with_no_client_auth();
    config
        .dangerous()
        .set_certificate_verifier(Arc::new(AcceptAll));

    let connector = TlsConnector::from(Arc::new(config));

    let addr = format!("{host}:443");
    let stream = tokio::time::timeout(
        std::time::Duration::from_secs(6),
        TcpStream::connect(&addr),
    )
    .await
    .map_err(|_| "TCP connect timed out".to_string())?
    .map_err(|e| format!("TCP connect failed: {e}"))?;

    let server_name = ServerName::try_from(host.clone())
        .map_err(|_| "Invalid server name".to_string())?;

    let mut tls = tokio::time::timeout(
        std::time::Duration::from_secs(6),
        connector.connect(server_name, stream),
    )
    .await
    .map_err(|_| "TLS handshake timed out".to_string())?
    .map_err(|e| format!("TLS handshake failed: {e}"))?;

    let (_io, conn) = tls.get_ref();
    let protocol = conn.protocol_version().map(|v| format!("{v:?}"));
    let certs = conn
        .peer_certificates()
        .ok_or_else(|| "No certificate returned".to_string())?
        .to_vec();

    // close politely
    let _ = tls.shutdown().await;

    let leaf = certs.first().ok_or_else(|| "Empty cert chain".to_string())?;
    let (_, cert) = X509Certificate::from_der(leaf.as_ref())
        .map_err(|e| format!("Failed to parse certificate: {e}"))?;

    let subject = fmt_name(cert.subject());
    let issuer = fmt_name(cert.issuer());
    let valid_from = cert.validity().not_before.to_rfc2822().unwrap_or_else(|_| String::new());
    let valid_to = cert.validity().not_after.to_rfc2822().unwrap_or_else(|_| String::new());

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let not_after = cert.validity().not_after.timestamp();
    let days_remaining = (not_after - now) / 86_400;

    let mut alt_names: Vec<String> = Vec::new();
    for ext in cert.extensions() {
        if let ParsedExtension::SubjectAlternativeName(san) = ext.parsed_extension() {
            for n in &san.general_names {
                if let GeneralName::DNSName(d) = n {
                    alt_names.push(d.to_string());
                }
            }
        }
    }

    Ok(SslInfo {
        subject,
        issuer,
        valid_from,
        valid_to,
        days_remaining,
        alt_names,
        protocol,
    })
}
