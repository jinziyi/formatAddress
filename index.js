const fs = require('fs');
const path = require('path');
const fileDir = './source/';
const target = 'dist';

function formatData(data) {
    if (!data) {
        return {};
    }
    let dictionary = {};
    let withSection = {};
    let fileData = {};
    Object.keys(data).forEach(key => {
        const name = key.toLowerCase().split('-')[1];
        const values = data[key];
        if (name === 'us') {
            values.forEach(val => {
                const {cityCode, countryEnName, cityEName, sectionEnTitle} = val;
                dictionary[cityCode] = {
                    ...(dictionary[cityCode] || {}),
                    countryEnName,
                    cityEName,
                    sectionEnTitle: sectionEnTitle.toUpperCase(),
                    cityCode
                }
            })
        }
        if (name === 'cn') {
            values.forEach(val => {
                const {cityCode, countryName, cityName, sectionTitle} = val;
                dictionary[cityCode] = {
                    ...(dictionary[cityCode] || {}),
                    countryName,
                    cityName,
                    sectionTitle: sectionTitle.toUpperCase(),
                    cityCode
                }
            })
        }
        if (name === 'tw') {
            values.forEach(val => {
                const {cityCode, countryName, cityName, sectionTitle} = val;
                dictionary[cityCode] = {
                    ...(dictionary[cityCode] || {}),
                    countryTwName: countryName,
                    cityTwName: cityName,
                    sectionTwTitle: sectionTitle.toUpperCase(),
                    cityCode
                }
            })
        }
        withSection[key] = {}
    });
    Object.keys(dictionary).forEach(cityCode => {
        const value = dictionary[cityCode];
        const {sectionTitle, sectionEnTitle, sectionTwTitle} = value;
        withSection['en-US'] = {
            ...withSection['en-US'],
            [sectionEnTitle]: [...(withSection['en-US'][sectionEnTitle] || []), value]
        };
        withSection['zh-CN'] = {
            ...withSection['zh-CN'],
            [sectionTitle]: [...(withSection['zh-CN'][sectionTitle] || []), value]
        };
        withSection['zh-TW'] = {
            ...withSection['zh-TW'],
            [sectionTwTitle]: [...(withSection['zh-TW'][sectionTwTitle] || []), value]
        }
    });
    Object.keys(withSection).forEach(fileName => {
        fileData[fileName] = {}
        Object.keys(withSection[fileName]).sort().forEach(title => {
            fileData[fileName][title] = withSection[fileName][title];
        })
    });
    return {
        dictionary,
        fileData
    }
}

fs.readdir(fileDir, function (err, res = []) {
    const datas = res.reduce((last, file) => {
        const filename = file.split('.')[0];
        const data = fs.readFileSync(fileDir + file, 'utf8');
        let [keyString, ...vals] = data.split('\n');
        const keys = keyString.split(',').map(e => String(e).trim());
        return {
            ...last,
            [filename]: vals.map(vals => {
                let obj = {};
                vals.split(',').forEach((val, i) => {
                    let key = keys[i];
                    if(filename.toLowerCase() === 'en-us' && key === 'sectionTitle'){
                        key = 'sectionEnTitle';
                    }
                    obj[key] = String(val).trim();
                });
                return obj
            })
        };
    }, {});
    const fileData = formatData(datas);
    if(!fs.existsSync(target)){
        fs.mkdirSync(target)
    }
    
    fs.writeFile(`./${target}/dictionary.json`, JSON.stringify(fileData.dictionary, null, '\t'), function (err) {});
    Object.keys(fileData.fileData).forEach(fileName => {
        fs.writeFile(`./${target}/${fileName}.json`, JSON.stringify(fileData.fileData[fileName], null, '\t'), function (err) {});
    })
});