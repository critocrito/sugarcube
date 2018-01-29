# `@sugarcube/plugin-mail`

Plugins for SugarCube ...

## Installation

```
npm install --save @sugarcube/plugin-mail
```

## Usage

## `mail_diff_stats` plugin

This plugin sends statistics of type `diff`. It will send an email to every
recipient supplied using the `mail_recipient` query type. Skip the emailing if
there are no `added` of `removed` stats available.

The following example diffs two csv files, and mails in debug mode the diff
statistics to two recipients.

```
$(npm bin)/sugarcube -d \
  -Q mail_recipient:one@example.com \
  -Q mail_recipient:two@example.com \
  -Q glob_pattern:data/dump-$(date -d "today" +%Y-%m-%d).csv \
  -Q diff_glob_pattern:data/dump-$(date -d "yesterday" +%Y-%m-%d).csv \
  -p csv_import,csv_diff,mail_diff_stats \
  --csv.id_fields name \
  --mail.from three@example.com \
  --mail.debug
```

Every email is encrypted using gpg before sending. The `gpg` binary must be
installed and the recipient's public key imported into the users keyring and
be trusted. The email won't send if the encryption fails. To disable the
encryption use the `--mail.no-encrypt` option.

FIXME: Not tested on Windows, how would it work there with the `gpg` binary?

**Configuration**:

Uses `mail_recipient` as query type.

- `mail.debug`

  Turn on debug mode. In this mode mails are not actually sent, but only
  logged to the screen.

- `mail.no-encrypt`

  Disable the gpg encryption for this run. Emails will be send in clear text.

- `mail.from`

  Set this email address as sender in the `From:` header.

- `mail.smtp_user`

  Configure the user account for the SMTP server in use.

- `mail.smtp_password`

  Configure the password for the SMTP server in use.

- `mail.smtp_host`

  Configure the host name of the SMTP server in use.

- `mail.smtp_port`

  Configure the port of the SMTP server in use.
