# Dashboard

A dashboard written in PHP and adapted from the lolisafe image uploader.

Made to manage service queues for a workplace of mine written over the course of a christmas weekend.

Localized in German and made to print receipts onto A5 paper in duplex mode with a QR code generated locally.

No guarantees and the software is provided as is.

## Setup

- Rename `config/config.example.php` to `config/config.php` and edit values inside accordingly
- Rename `public/example_images` to `public/images` and edit all images to the desired needs
- Replace `public/setup.exe` with a custom client that has the user-agent `Service-Client 1.0.1` or build this [client](https://github.com/BigBrainAFK/service_client)
- Use php compose to install dependencies


### Foot notes
Originally written in 2020