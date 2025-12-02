import cloud from "d3-cloud";
import * as d3 from "d3";
import stopwords from "stopwords-en";
import {randomNoise} from "./noise.js";

const interpolates = [
  {name: "Rainbow", value: d3.interpolateRainbow},
  {name: "Sinebow", value: d3.interpolateSinebow},
  {name: "BrBG", value: d3.interpolateBrBG},
  {name: "PRGn", value: d3.interpolatePRGn},
  {name: "PiYG", value: d3.interpolatePiYG},
  {name: "PuOr", value: d3.interpolatePuOr},
  {name: "RdBu", value: d3.interpolateRdBu},
  {name: "RdGy", value: d3.interpolateRdGy},
  {name: "RdYlBu", value: d3.interpolateRdYlBu},
  {name: "RdYlGn", value: d3.interpolateRdYlGn},
  {name: "Spectral", value: d3.interpolateSpectral},
  {name: "Blues", value: d3.interpolateBlues},
  {name: "BuGn", value: d3.interpolateBuGn},
  {name: "BuPu", value: d3.interpolateBuPu},
  {name: "Cividis", value: d3.interpolateCividis},
  {name: "Cool", value: d3.interpolateCool},
  {name: "Cubehelix Default", value: d3.interpolateCubehelixDefault},
  {name: "GnBu", value: d3.interpolateGnBu},
  {name: "Greens", value: d3.interpolateGreens},
  {name: "Greys", value: d3.interpolateGreys},
  {name: "Inferno", value: d3.interpolateInferno},
  {name: "Magma", value: d3.interpolateMagma},
  {name: "Oranges", value: d3.interpolateOranges},
  {name: "OrRd", value: d3.interpolateOrRd},
  {name: "Plasma", value: d3.interpolatePlasma},
  {name: "PuBu", value: d3.interpolatePuBu},
  {name: "PuBuGn", value: d3.interpolatePuBuGn},
  {name: "PuRd", value: d3.interpolatePuRd},
  {name: "Purples", value: d3.interpolatePurples},
  {name: "RdPu", value: d3.interpolateRdPu},
  {name: "Reds", value: d3.interpolateReds},
  {name: "Turbo", value: d3.interpolateTurbo},
  {name: "Viridis", value: d3.interpolateViridis},
  {name: "Warm", value: d3.interpolateWarm},
  {name: "YlGn", value: d3.interpolateYlGn},
  {name: "YlGnBu", value: d3.interpolateYlGnBu},
  {name: "YlOrBr", value: d3.interpolateYlOrBr},
];

function computeWordFrequencies(inputText, stopwords) {
  const words = inputText
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const filteredWords = words.filter((word) => !stopwords.includes(word));
  const frequencyMap = filteredWords.reduce((acc, word) => ((acc[word] = (acc[word] || 0) + 1), acc), {});
  const wordFreqs = Object.entries(frequencyMap)
    .map(([text, count]) => ({text, count}))
    .sort((a, b) => b.count - a.count);
  return wordFreqs;
}

function randomAngle(angleStart, angleEnd, angleStep) {
  const angles = d3.range(angleStart, angleEnd, angleStep);
  const random = d3.randomInt(0, angles.length);
  return () => angles[random()];
}

function randomInterpolate() {
  const random = d3.randomInt(0, interpolates.length);
  return interpolates[random()].value;
}

function randomRightAngle() {
  return () => ~~(Math.random() * 2) * 90;
}

export function wordle(
  text,
  {width = 960, height = 600, angleStart = -60, angleEnd = 60, angleStep = 5, count = 250, right = false} = {},
) {
  const wordFreqs = computeWordFrequencies(text, stopwords).slice(0, count);
  const angle = right ? randomRightAngle() : randomAngle(angleStart, angleEnd, angleStep);

  const sizeScale = d3
    .scaleLog()
    .domain(d3.extent(wordFreqs, (d) => d.count))
    .range([30, 120]);

  const words = wordFreqs.map((d) => ({
    text: d.text,
    size: sizeScale(d.count),
    count: d.count,
  }));

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

  g.selectAll("text").remove();

  let timer = null;

  const layout = cloud()
    .size([width, height])
    .words(words)
    .padding(1)
    .rotate(angle)
    .font("Impact")
    .fontSize((d) => d.size)
    .fontWeight("bold")
    .on("end", draw);

  layout.start();

  function draw(words) {
    const noiseX = randomNoise(-20, 20, {octaves: 3, seed: Math.random()});
    const noiseY = randomNoise(-20, 20, {octaves: 3, seed: Math.random()});

    const layeredWords = words.map((d) => {
      const words = [];
      let size = d.size;
      let z = 0;
      while (size >= 20) {
        words.push({...d, size: size, z: z++});
        size -= 10;
      }
      const color = d3
        .scaleSequential(d3.interpolateViridis) // Default to viridis
        .domain(d3.extent(words, (d) => d.size).reverse());
      return words.map((d) => ({...d, fill: color(d.size)}));
    });

    const groups = g
      .selectAll("g")
      .data(layeredWords.flat().sort((a, b) => a.z - b.z))
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})rotate(${d.rotate})`);

    const texts = groups
      .append("text")
      .attr("font-size", (d) => `${d.size}px`)
      .attr("font-family", "Impact")
      .attr("fill", (d) => d.fill)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.1)
      .text((d) => d.text);

    let frame = 0;

    timer = d3.interval(() => {
      frame++;
      const interpolate = randomInterpolate();

      for (const words of layeredWords) {
        const dx = noiseX(words[0].x + frame);
        const dy = noiseY(words[0].y + frame);
        const scale = d3
          .scaleSequential(interpolate) // Pick a random interpolate from the list
          .domain(d3.extent(words, (d) => d.size).reverse());
        for (let i = 0; i < words.length; i++) {
          words[i].dx = dx * i;
          words[i].dy = dy * i;
          words[i].index = i;
          words[i].fill = scale(words[i].size);
        }
      }

      groups
        .transition()
        .duration(1000)
        .delay((d) => d.index * 20)
        .ease(d3.easeElastic)
        .attr("transform", (d) => `translate(${d.x + d.dx}, ${d.y + d.dy})rotate(${d.rotate})`);

      texts
        .transition()
        .duration(1000)
        .delay((d) => d.index * 20)
        .attr("fill", (d) => d.fill);
    }, 2000);
  }

  const node = svg.node();

  node.dispose = () => {
    if (timer) {
      timer.stop();
      timer = null;
    }
  };

  return node;
}
