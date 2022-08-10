# Email Templates

Each email template can be referenced through the utility `createEmailTemplate` and the email can be sent via `sendEmail`. However, setup is required for Relm to read each template.

## File Structure
For each unique email template, the file tree should look like this
```
/templates
  /emails
    /id_to_call_email_template
      email.html
      email.json
    ...
```

```html
<!-- email.html -->
<!DOCTYPE html>
<html>
  <body>
    Content to send in the email if the email service supports HTML
  </body>
</html>
```

```json
// email.json
{
  "subject": "Subject of the email to send",
  "content": "Content to send in the email if the email service does NOT support HTML"
}
```

Additionally, variables can be specified within these templates via `{{VARIABLE_NAME}}` and these get replaced when `createEmailTemplate` is called.