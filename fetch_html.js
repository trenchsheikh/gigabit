const fs = require('fs');
const https = require('https');

const url = 'https://www.rightmove.co.uk/properties/168092597';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('rightmove_property.html', data);
        console.log('HTML saved to rightmove_property.html');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
