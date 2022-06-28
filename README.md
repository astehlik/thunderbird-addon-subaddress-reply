# Subaddress Reply

This Thunderbird Add-on handles replying to a messages that were sent to a
[subaddess](https://en.wikipedia.org/wiki/Email_address#Subaddressing).

An example:

1. You primary mail address is tim@mymail.tld
2. You receive a mail to the subaddress tim+mailinglists@mymail.tld
3. When you reply to this mail the sender is set to tim+mailinglists@mymail.tld by this Add-on

## What is a subaddress?

Mail software like [Postfix](https://www.postfix.org/postconf.5.html#recipient_delimiter) 
or [qmail](http://cr.yp.to/qmail.html) or providers like
[Gmail](https://support.google.com/a/users/answer/9308648?hl=en) allow the usage of so called subaddresses.

This means you can add suffixes to your primary mail address and get an unlimited amount of mail addresses.

Postfix or Gmail use `+` as a separator by default, qmail uses `-`.

This means when your primary address is tim@mymail.tld you will also receive mails that are send
to tim+mailinglists@mymail.tld or tim+shopping@mymail.tld.

This allows you to filter emails depending on the recipient to which they are sent. I also allows you to
track if a company is giving your email address to third parties when you embed the company's name
in your mail address e.g. tim+a-company@mymail.tld

## Permissions

These permissions are required by the Add-on for these reasons:

### `tabs`

Watch for new tabs of type `messageCompose` with an event listener to `browser.tabs.onCreated`. We need
the `tab.id` to fetch the Compose details.

### `compose`

We fetch the Compose details to check if the created message is a reply to a message sent to a subaddress.

If it is a reply we set the From-Address to the subaddress if required.

### `messagesRead`

We fetch the message that the user replies to. The message is needed to get its recipients to check if it
was sent to a subaddress.

## Experiments APIs

This Add-on uses an Experiments API for splitting name and email from a combined string.

It uses `MailServices.headerParser.parseEncodedHeaderW()` to archive it.

E.g. `My Name <mymail@domain.tld>` is converted to:

```json
{
    "name": "My Name",
    "email": "mymail@domain.tld"
}
```
