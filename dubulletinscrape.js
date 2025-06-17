const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

// Fetch and parse the webpage
axios.get('https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext')
  .then(response => {
    console.log('Fetching webpage...');
    const $ = cheerio.load(response.data); // Load the fetched HTML into Cheerio
    let courseBlocks = $('div.courseblock'); // Select all course blocks
    console.log(`Found ${courseBlocks.length} course blocks.`);

    const courses = []; // Array to store filtered courses

    courseBlocks.each((index, element) => {
      const titleElement = $(element).find('p.courseblocktitle').text().trim();
      const descElement = $(element).find('p.courseblockdesc').text().trim();

      const classNumberMatch = titleElement.match(/COMP[\s\u00a0](\d+)/);
      const classNumber = classNumberMatch ? parseInt(classNumberMatch[1]) : null;

      // Filter for courses with class numbers 3000 and above, excluding those with 'prerequisite' in the description
      if (classNumber && classNumber >= 3000 && !descElement.toLowerCase().includes('prerequisite')) {
        const courseCode = `COMP-${classNumber}`;
        const courseTitle = titleElement.replace(/COMP[\s\u00a0]\d+/, '').trim();
        courses.push({
          course: courseCode,
          title: courseTitle,
          description: descElement
        });
        console.log(`Saved course: ${courseCode} - ${courseTitle}`);
      }
    });

    // Save results to JSON file
    const outputPath = './results/bulletin.json';
    fs.mkdirSync('./results', { recursive: true }); // Ensure the directory exists
    fs.writeFileSync(outputPath, JSON.stringify({ courses }, null, 2)); // Write JSON file
    console.log(`Saved ${courses.length} courses to ${outputPath}`);
  })
  .catch(error => {
    console.error('Error fetching and parsing the page:', error.message); // Improved error handling
  });
  
