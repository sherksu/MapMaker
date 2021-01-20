import Papa from 'papaparse';

const handleFile2JSON = (f) =>
  new Promise((resolve, reject) => {
    if (f) {
      const reader = new FileReader();
      reader.readAsText(f, 'UTF-8');
      reader.onload = (evt) => {
        const fileContent = evt.target.result;
        const fileJSON = Papa.parse(fileContent);
        resolve(fileJSON);
      };
    }
  });

export { handleFile2JSON };
