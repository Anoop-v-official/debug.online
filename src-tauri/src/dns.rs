use hickory_resolver::config::*;
use hickory_resolver::TokioAsyncResolver;
use serde::Serialize;

#[derive(Serialize)]
pub struct DnsRecord {
    pub value: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ttl: Option<u32>,
}

#[derive(Serialize)]
pub struct DnsAnswer {
    pub r#type: String,
    pub records: Vec<DnsRecord>,
}

fn valid_host(host: &str) -> bool {
    if host.is_empty() || host.len() > 253 {
        return false;
    }
    host.chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.')
        && host.contains('.')
}

#[tauri::command]
pub async fn dns_lookup(host: String, r#type: String) -> Result<DnsAnswer, String> {
    let host = host.trim().to_ascii_lowercase();
    let kind = r#type.to_ascii_uppercase();
    if !valid_host(&host) {
        return Err("Invalid hostname".into());
    }

    let mut config = ResolverConfig::new();
    config.add_name_server(NameServerConfig {
        socket_addr: "1.1.1.1:53".parse().unwrap(),
        protocol: Protocol::Udp,
        tls_dns_name: None,
        trust_negative_responses: true,
        bind_addr: None,
    });
    config.add_name_server(NameServerConfig {
        socket_addr: "8.8.8.8:53".parse().unwrap(),
        protocol: Protocol::Udp,
        tls_dns_name: None,
        trust_negative_responses: true,
        bind_addr: None,
    });

    let mut opts = ResolverOpts::default();
    opts.timeout = std::time::Duration::from_secs(5);
    opts.attempts = 2;

    let resolver = TokioAsyncResolver::tokio(config, opts);

    let records = match kind.as_str() {
        "A" => match resolver.ipv4_lookup(&host).await {
            Ok(lookup) => lookup
                .iter()
                .map(|ip| DnsRecord {
                    value: ip.to_string(),
                    priority: None,
                    ttl: None,
                })
                .collect(),
            Err(_) => Vec::new(),
        },
        "AAAA" => match resolver.ipv6_lookup(&host).await {
            Ok(lookup) => lookup
                .iter()
                .map(|ip| DnsRecord {
                    value: ip.to_string(),
                    priority: None,
                    ttl: None,
                })
                .collect(),
            Err(_) => Vec::new(),
        },
        "MX" => match resolver.mx_lookup(&host).await {
            Ok(lookup) => {
                let mut v: Vec<_> = lookup
                    .iter()
                    .map(|m| DnsRecord {
                        value: m.exchange().to_utf8(),
                        priority: Some(m.preference()),
                        ttl: None,
                    })
                    .collect();
                v.sort_by_key(|r| r.priority.unwrap_or(0));
                v
            }
            Err(_) => Vec::new(),
        },
        "TXT" => match resolver.txt_lookup(&host).await {
            Ok(lookup) => lookup
                .iter()
                .map(|t| DnsRecord {
                    value: t
                        .iter()
                        .map(|d| String::from_utf8_lossy(d).into_owned())
                        .collect::<Vec<_>>()
                        .join(""),
                    priority: None,
                    ttl: None,
                })
                .collect(),
            Err(_) => Vec::new(),
        },
        "NS" => match resolver.ns_lookup(&host).await {
            Ok(lookup) => lookup
                .iter()
                .map(|n| DnsRecord {
                    value: n.to_utf8(),
                    priority: None,
                    ttl: None,
                })
                .collect(),
            Err(_) => Vec::new(),
        },
        "CNAME" => match resolver.lookup(&host, hickory_resolver::proto::rr::RecordType::CNAME).await {
            Ok(lookup) => lookup
                .iter()
                .filter_map(|r| r.as_cname().map(|c| DnsRecord {
                    value: c.to_utf8(),
                    priority: None,
                    ttl: None,
                }))
                .collect(),
            Err(_) => Vec::new(),
        },
        _ => return Err("Unsupported record type".into()),
    };

    Ok(DnsAnswer {
        r#type: kind,
        records,
    })
}
