const fs = require('fs');

fs.readFile('words.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  try {
    const words = data.split('\n');
    const filteredWords = words.filter(word => word.length === 5 && /^[a-zA-Z]+$/.test(word));

    console.log(`${filteredWords.length} words`)

    fs.writeFile('filteredWords.json', JSON.stringify(filteredWords), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return;
      }

      console.log('Filtered words successfully written to filteredWords.json');
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
