export default function Post() {
  return (
    <>
      <p>
        Unix file permissions are one of those things you learn once, forget, and look up every
        time. <code>755</code>, <code>644</code>, <code>600</code> — the numbers feel arbitrary
        until you understand the bitmath, at which point they become obvious. This post is the
        explanation I wish someone had given me on day one.
      </p>

      <h2>The mental model: three users, three actions</h2>

      <p>
        Every file on Unix has three classes of user that interact with it:
      </p>

      <ul>
        <li><strong>Owner</strong> (also called user, or <code>u</code>): the user who owns the file.</li>
        <li><strong>Group</strong> (<code>g</code>): the group the file belongs to.</li>
        <li><strong>Other</strong> (<code>o</code>): everyone else.</li>
      </ul>

      <p>
        For each class, three actions are independently permitted or denied:
      </p>

      <ul>
        <li><strong>Read</strong> (<code>r</code>): may see the file&apos;s contents (or list a directory).</li>
        <li><strong>Write</strong> (<code>w</code>): may modify the file (or add/remove entries in a directory).</li>
        <li><strong>Execute</strong> (<code>x</code>): may run the file as a program (or <code>cd</code> into a directory).</li>
      </ul>

      <p>
        Three classes times three actions equals nine permission bits. That is the entire model.
      </p>

      <h2>Where the numbers come from</h2>

      <p>
        Each action gets a value: <code>r = 4</code>, <code>w = 2</code>, <code>x = 1</code>. These
        are chosen so that summing them never causes a carry — every combination produces a unique
        number from 0 to 7.
      </p>

      <pre>
        <code>{`rwx = 4+2+1 = 7
rw- = 4+2   = 6
r-x = 4+1   = 5
r-- = 4     = 4
-wx = 2+1   = 3
-w- = 2     = 2
--x = 1     = 1
--- = 0     = 0`}</code>
      </pre>

      <p>
        Three triples (owner, group, other) gives you three octal digits. So:
      </p>

      <ul>
        <li><code>755</code> = <code>rwx</code> for owner, <code>r-x</code> for group, <code>r-x</code> for other.</li>
        <li><code>644</code> = <code>rw-</code> for owner, <code>r--</code> for group, <code>r--</code> for other.</li>
        <li><code>600</code> = <code>rw-</code> for owner, nothing for group, nothing for other.</li>
        <li><code>700</code> = <code>rwx</code> for owner, nothing for anyone else.</li>
      </ul>

      <p>
        Once you see this, the numbers are not arbitrary — they are addition.
      </p>

      <h2>The canonical recipes</h2>

      <h3>755 — executables and directories</h3>

      <p>
        Owner does anything, everyone else can read and traverse. This is the default for shell
        scripts, compiled binaries, and most directories. <code>chmod 755 deploy.sh</code> is the
        line every README has somewhere.
      </p>

      <h3>644 — regular files</h3>

      <p>
        Owner reads and writes; everyone else reads only. Source files, configs that should be
        world-readable, static assets. The implicit default on most systems when you create a file.
      </p>

      <h3>600 — private files</h3>

      <p>
        Only the owner can read or write. Nothing for group or other. Used for SSH private keys,
        password files, and anything that absolutely must not be readable by other users on the
        system.
      </p>

      <p>
        OpenSSH famously refuses to use a private key with anything looser than <code>600</code>.
        If you ever see <code>"WARNING: UNPROTECTED PRIVATE KEY FILE!"</code>, the fix is{' '}
        <code>chmod 600 ~/.ssh/id_rsa</code>.
      </p>

      <h3>700 — private directories</h3>

      <p>
        Only the owner can do anything. <code>~/.ssh</code> uses this — even reading the directory
        to see which keys exist requires being you.
      </p>

      <h2>The directory trap</h2>

      <p>
        Permissions on directories mean something different than permissions on files. This is the
        single most common confusion.
      </p>

      <ul>
        <li>
          <strong>Read</strong> on a directory: may <em>list</em> the directory&apos;s contents
          (the file names). It does NOT let you read the files inside.
        </li>
        <li>
          <strong>Write</strong> on a directory: may add or remove entries (create/delete files).
          It does NOT let you modify file contents.
        </li>
        <li>
          <strong>Execute</strong> on a directory: may <em>traverse</em> the directory —{' '}
          <code>cd</code> into it, or open a file by full path. Without this, the directory is
          opaque even if you have read on it.
        </li>
      </ul>

      <p>
        The practical implication: a directory with mode <code>--x</code> (just execute) is a
        directory you can pass through to reach known files, but cannot list. <code>r--</code>{' '}
        (read only) lists names but cannot open anything. <code>rwx</code> is the normal case.
      </p>

      <h2>Symbolic mode: the verbose form</h2>

      <p>
        Octal is great for setting a known mode in full. When you want to add or remove a single
        permission, symbolic mode is clearer:
      </p>

      <pre>
        <code>{`chmod u+x deploy.sh        # add execute for owner
chmod go-w secrets.txt     # remove write for group and other
chmod a+r README.md        # add read for all (a = u + g + o)
chmod o= /var/private      # set other to nothing`}</code>
      </pre>

      <p>
        The pattern is <code>[ugoa][+-=][rwx]</code>. <code>u</code>/<code>g</code>/<code>o</code>
        /<code>a</code> for which class; <code>+</code>/<code>-</code>/<code>=</code> for
        add/remove/set-exactly; <code>r</code>/<code>w</code>/<code>x</code> for which permission.
      </p>

      <h2>The special bits</h2>

      <p>
        Three more bits exist beyond the standard nine, encoded as a fourth leading octal digit:
      </p>

      <h3>Setuid (4xxx)</h3>

      <p>
        When set on an executable, the program runs as the file&apos;s owner rather than as the
        user who invoked it. Used by <code>sudo</code>, <code>passwd</code>, <code>ping</code> —
        programs that need a moment of root access to do something specific.
      </p>

      <p>
        <code>chmod 4755 binary</code> sets setuid + standard 755. The mode displays as{' '}
        <code>rwsr-xr-x</code> (note the lowercase <code>s</code> instead of <code>x</code>).
      </p>

      <h3>Setgid (2xxx)</h3>

      <p>
        Same idea but for group ownership. On a directory, setgid means new files inherit the
        directory&apos;s group instead of the creator&apos;s primary group — useful for shared
        team directories.
      </p>

      <h3>Sticky bit (1xxx)</h3>

      <p>
        On a directory, the sticky bit means &quot;only the owner of a file inside this directory
        may delete or rename it&quot; — even if other users have write permission on the directory.
      </p>

      <p>
        This is what protects <code>/tmp</code>. The mode is <code>1777</code> (sticky + rwx for
        everyone). Any user can create a file in /tmp, but only the creator can delete their own
        file.
      </p>

      <h2>umask: the default-mode subtraction</h2>

      <p>
        umask is the permissions that newly-created files and directories will NOT have. It is
        subtracted from the maximum (666 for files, 777 for directories) when a process creates
        something.
      </p>

      <ul>
        <li>
          <code>umask 022</code>: new files default to <code>644</code> (666 - 022). New
          directories default to <code>755</code> (777 - 022). The standard for shared systems.
        </li>
        <li>
          <code>umask 077</code>: new files default to <code>600</code>, directories to{' '}
          <code>700</code>. The standard for private home directories.
        </li>
      </ul>

      <p>
        Set in your shell rc file. Server-side processes (web servers, daemons) usually set their
        own umask explicitly.
      </p>

      <h2>The 5 minute checklist</h2>

      <ul>
        <li>Executables and directories: <code>755</code>.</li>
        <li>Regular files: <code>644</code>.</li>
        <li>Private files (SSH keys, secrets): <code>600</code>.</li>
        <li>Private directories: <code>700</code>.</li>
        <li>Shared writable temp dirs: <code>1777</code> (sticky bit + rwx for all).</li>
        <li>If you see &quot;Permissions are too open&quot;, the answer is almost always <code>chmod 600</code>.</li>
        <li>For chaining changes by class: <code>chmod u+x</code>, <code>chmod go-w</code>, etc.</li>
      </ul>

      <p>
        Bookmark the <a href="/tools/chmod-calculator">Chmod Calculator</a> for the day you need
        to compute <code>4755</code> from a checkbox and stop counting bits on your fingers.
      </p>
    </>
  );
}
