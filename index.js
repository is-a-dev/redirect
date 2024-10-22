const express = require('express');
const dns = require('dns');
const app = express();

// Function to perform DNS TXT lookup for _redirect.DOMAIN
function getTxtRecord(domain) {
    return new Promise((resolve, reject) => {
        const redirectDomain = `_redirect.${domain}`; // Specify _redirect.DOMAIN

        dns.resolveTxt(redirectDomain, (err, records) => {
            if (err) {
                reject(err);
            } else {
                // Flattening the TXT records in case there are multiple parts
                resolve(records.flat().join(''));
            }
        });
    });
}

// Middleware to check domain and redirect based on the _redirect.DOMAIN TXT record
app.use(async (req, res, next) => {
    try {
        const domain = req.hostname; // Get the domain from the request
        const txtRecord = await getTxtRecord(domain); // Fetch the TXT record from _redirect.DOMAIN

        if (txtRecord.startsWith('http://') || txtRecord.startsWith('https://')) {
            // Redirect to the URL specified in the TXT record
            res.redirect(txtRecord);
        } else {
            // If the TXT record is not a valid URL, send a response
            res.send(`No valid URL found in TXT record for _redirect.${domain}`);
        }
    } catch (error) {
        res.status(202).send(`Unable to resolve TXT record for _redirect.${req.hostname}`);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
