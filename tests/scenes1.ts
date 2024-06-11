const scenes = [
  {
    wrapper: '#intro',
    duration: '150%',
    animations: [
      {
        selector: '.square01',
        translateY: {
          positions: ['0%', '0%', '-25%', '25%'],
          keys: ['0%', '40%', '80%', '100%'],
        },
        translateX: '-35%',
        opacity: {
          positions: [1, 0.6, 0.6, 0],
          keys: ['0%', '75%', '75%', '100%'],
        },
        scale: 2,
      },
      {
        selector: '.square02',
        translateY: '-15%',
        opacity: 1,
      },
    ],
  },
  {
    wrapper: '#intro',
    duration: '50%',
    animations: [
      {
        translateY: ['-15%', '-15%'],
        selector: '.square02',
        rotate: -120,
      },
      {
        selector: '.square03',
        translateY: -120,
        opacity: 1,
        scale: 0.25,
      },
    ],
  },
];

export default scenes;
