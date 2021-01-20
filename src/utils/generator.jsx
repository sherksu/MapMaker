import tinygradient from 'tinygradient';

// generate default gradient object.
const colorGradient = {
  yellow2red: tinygradient(
    { color: '#fcdc00', pos: 0 },
    { color: '#ff1515', pos: 1 }
  ),
  green2yellow: tinygradient(
    { color: '#59ff15', pos: 0 },
    { color: '#fcdc00', pos: 1 }
  ),
};

export { colorGradient };
