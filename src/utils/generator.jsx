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
  green2red: tinygradient(
    { color: '#59ff15', pos: 0 },
    { color: '#ff1515', pos: 1 }
  ),
  createTwo: ({ c1, c2, c3 } = {}) => {
    const rbl = tinygradient({ color: c1, pos: 0 }, { color: c2, pos: 1 });
    const rbh = tinygradient({ color: c2, pos: 0 }, { color: c3, pos: 1 });
    const view = tinygradient(
      { color: c1, pos: 0 },
      { color: c2, pos: 0.5 },
      { color: c3, pos: 1 }
    );
    return { rbl, rbh, view };
  },
};

export { colorGradient };
