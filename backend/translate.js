const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const timer = ms => new Promise(res => setTimeout(res, ms));
const getDefinitions = async (word) => {
  try {
    const url = new URL('https://mashape-community-urban-dictionary.p.rapidapi.com/define');
    url.searchParams.set('term', word);
    const response = await axios.get(url.toString(), {
      httpsAgent,
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'mashape-community-urban-dictionary.p.rapidapi.com'
      }
    });

    // console.log(response.data)
    return response.data?.list;
  } catch (error) {
    console.error('[ERROR]', error?.response?.data);
  }
}

console.time('start');

async function readFileAsync(filePath, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

async function writeFileAsync(filePath, data, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

async function saveTranslatedWords() {
  try {
    const filePath = path.join(__dirname, 'translatedWords.json');
    const data = await readFileAsync(filePath, 'utf8');
    const translatedWords = JSON.parse(data);

    console.log(`${translatedWords.length} words, ${translatedWords.filter(w => w.definitions.length).length} has definitions,
    ${translatedWords.filter(w => w.translated).length} has translated`);
    console.log(`${translatedWords.filter(w => !w.translated).length} has left`);

    if (translatedWords.every(w => w.translated)) {
      console.log('All words have been translated!');
      return;
    }

    let loopCount = 0;
    let saveCount = 0;

    for (let wordObj of translatedWords) {
      if (wordObj.translated) {
        continue;
      }

      const index = translatedWords.findIndex(translate => translate.word === wordObj.word);

      console.log(wordObj.word, `LOOP COUNT: ${loopCount}`, `SAVE COUNT: ${saveCount}`, `INDEX: ${index}`);
      const definitions = await getDefinitions(wordObj.word);
      wordObj.definitions = definitions || [];
      wordObj.translated = true;

      if (++loopCount % 50 === 0) {
        await writeFileAsync(filePath, JSON.stringify(translatedWords, null, '\t'), 'utf8');
        console.log('Translated words successfully saved to file:', filePath);
        saveCount++;
      }

      await timer(2000);
    }

    await writeFileAsync(filePath, JSON.stringify(translatedWords, null, '\t'), 'utf8');
    console.log('Translated words successfully saved to file:', filePath);
    console.timeEnd('start');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function cleanupDefinitions() {
  try {
    const filePath = path.join(__dirname, 'translatedWords.json');
    const data = await readFileAsync(filePath, 'utf8');
    let translatedWords = JSON.parse(data);

    console.log(`${translatedWords.length} words, ${translatedWords.filter(w => w.definitions.length).length} has definitions,
    ${translatedWords.filter(w => w.translated).length} has translated`);

    for (let index in translatedWords) {
      const wordObj = translatedWords[index];
      if (!wordObj.definitions?.length) {
        continue;
      }


      wordObj.definitions = wordObj.definitions.map(definitions => definitions.definition);
    }

    console.log(`${translatedWords.length} words, ${translatedWords.filter(w => w.definitions.length).length} has definitions,
    ${translatedWords.filter(w => w.translated).length} has translated`);
    translatedWords = translatedWords.filter(w => w.definitions.length);

    await writeFileAsync(path.join(__dirname, 'translatedWords2.json'), JSON.stringify(translatedWords, null, '\t'), 'utf8');
    console.log('Translated words successfully saved to file:', filePath);
    console.timeEnd('start');
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanupDefinitions();
