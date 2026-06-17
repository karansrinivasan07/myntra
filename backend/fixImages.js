// Fix broken image URLs in the running database
const http = require('http');

const fixes = [
    {
        name: "Embroidered Anarkali Kurta",
        brand: "W",
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop"
        ]
    },
    {
        name: "Ribbed Knit Co-ord Set",
        brand: "Zara",
        images: [
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop"
        ]
    },
    {
        name: "Linen Blend Wide-Leg Trousers",
        brand: "Vero Moda",
        images: [
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop"
        ]
    },
    {
        name: "Leather Bifold Wallet",
        brand: "Baggit",
        images: [
            "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0a4?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512532939431-4c9a7b9a2a74?w=500&auto=format&fit=crop"
        ]
    },
    {
        name: "Matte Lipstick Set - 5 Shades",
        brand: "Maybelline",
        images: [
            "https://images.unsplash.com/photo-1631214540553-ff044a3ff1ea?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop"
        ]
    }
];

// Get all products, find matching ones, then PATCH them
http.get('http://localhost:5000/product', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const products = JSON.parse(d);
        let fixCount = 0;
        for (const fix of fixes) {
            const match = products.find(p => p.name === fix.name && p.brand === fix.brand);
            if (match) {
                // Use admin endpoint to update product images
                const patchData = JSON.stringify({ images: fix.images });
                const req = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: `/admin/products/${match._id}`,
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                }, (res2) => {
                    let body = '';
                    res2.on('data', c => body += c);
                    res2.on('end', () => {
                        fixCount++;
                        console.log(`Fixed [${fix.brand}] ${fix.name} - Status: ${res2.statusCode}`);
                        if (fixCount === fixes.length) console.log('\nAll done! ' + fixCount + ' products fixed.');
                    });
                });
                req.write(patchData);
                req.end();
            } else {
                console.log(`Not found: [${fix.brand}] ${fix.name}`);
                fixCount++;
            }
        }
    });
});
