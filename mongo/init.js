db = db.getSiblingDB('survey_db');

db.createUser({
  user: 'survey_user',
  pwd: 'userpassword',
  roles: [{ role: 'readWrite', db: 'survey_db' }]
});

db.createCollection('surveys');
db.createCollection('responses');
db.createCollection('analytics_cache');

db.responses.createIndex({ surveyId: 1 });
db.analytics_cache.createIndex({ 
  "key.surveyId": 1, 
  "key.questionId": 1 
}, { unique: true });
db.analytics_cache.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

const burgerSurveyJson = {
  "title": "Burger Satisfaction Survey",
  "description": "Survey to measure customer satisfaction with our burgers",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "text",
          "name": "q1",
          "title": "How many burgers do you consume per month?",
          "inputType": "number",
          "min": 0,
          "max": 100
        },
        {
          "type": "text",
          "name": "q2",
          "title": "When was your last burger purchase?",
          "inputType": "date"
        },
        {
          "type": "radiogroup",
          "name": "q3",
          "title": "Which burger is your favorite?",
          "choices": [
            "Classic Cheeseburger",
            "BBQ Bacon",
            "Mushroom Swiss",
            "Veggie Deluxe",
            "Double Trouble"
          ]
        },
        {
          "type": "checkbox",
          "name": "q4",
          "title": "What toppings do you prefer? (Select all that apply)",
          "choices": [
            "Lettuce",
            "Tomato",
            "Onion",
            "Pickles",
            "Bacon",
            "Extra Cheese",
            "Avocado",
            "Jalapenos"
          ]
        },
        {
          "type": "rating",
          "name": "q5",
          "title": "Rate your overall satisfaction with our burgers",
          "rateMin": 1,
          "rateMax": 5,
          "minRateDescription": "Very Dissatisfied",
          "maxRateDescription": "Very Satisfied"
        },
        {
          "type": "ranking",
          "name": "q6",
          "title": "Rank the following aspects by importance (1 = Most Important)",
          "choices": [
            "Taste",
            "Price",
            "Portion Size",
            "Freshness",
            "Presentation"
          ]
        }
      ]
    }
  ]
};

db.surveys.insertOne({
  _id: "burger_survey_2023",
  id: "burger_survey_2023",
  name: "Burger Satisfaction Survey",
  json: burgerSurveyJson
});

const questions = burgerSurveyJson.pages[0].elements;

const responses = [
  {
    surveyId: "burger_survey_2023",
    userId: "user001",
    answers: {
      q1: 8,
      q2: new Date("2023-10-15"),
      q3: "BBQ Bacon",
      q4: ["Bacon", "Extra Cheese", "Onion"],
      q5: 5,
      q6: [ "Taste", "Price", "Portion Size", "Freshness", "Presentation" ]
    },
    createdAt: new Date("2023-10-16T10:30:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user002",
    answers: {
      q1: 6,
      q2: new Date("2023-10-13"),
      q3: "Double Trouble",
      q4: ["Bacon", "Extra Cheese", "Jalapenos"],
      q5: 5,
      q6: [ "Portion Size", "Taste", "Price", "Presentation", "Freshness" ]
    },
    createdAt: new Date("2023-10-16T15:45:00Z")
  }
];

db.responses.insertMany(responses);

questions.forEach(question => {
  const stats = {};
  
  switch(question.type) {
    case "number":
      const numResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: null,
          avg: { $avg: `$answers.${question.name}` },
          min: { $min: `$answers.${question.name}` },
          max: { $max: `$answers.${question.name}` }
        }}
      ]).next();
      stats.value = numResult;
      break;
      
    case "single_choice":
      const choiceResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.name}`,
          count: { $sum: 1 }
        }}
      ]).toArray();
      stats.options = choiceResult;
      break;
      
    case "rating":
      const ratingResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.name}`,
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray();
      stats.distribution = ratingResult;
      break;
  }
  
  db.analytics_cache.insertOne({
    key: {
      surveyId: "burger_survey_2023",
      questionId: question.name
    },
    data: stats,
    updatedAt: new Date()
  });
});

print("Burger survey initialized successfully!");

function generateGaussianInt(mean = 0, stdDev = 1, min = -Infinity, max = Infinity) {
  let u1 = Math.random();
  let u2 = Math.random();
  let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  let value = Math.round(z0 * stdDev + mean);
  return Math.min(Math.max(value, min), max);
}

// Configuration
const SURVEY_ID = 'burger_survey_2023';
const RESPONSES_COUNT = generateGaussianInt(2000, 1000);

// Survey options
const surveyElements = burgerSurveyJson.pages[0].elements;
const burgerOptions = surveyElements.find(el => el.name === "q3")?.choices;
const toppingOptions = surveyElements.find(el => el.name === "q4")?.choices;
const aspects = surveyElements.find(el => el.name === "q6")?.choices;

// Generate random responses
function generateResponses(count) {
  const responses = [];
  const startDate = new Date(2023, 0, 1); // Jan 1, 2023
  const endDate = new Date(2023, 11, 31); // Dec 31, 2023
  
  for (let i = 0; i < count; i++) {
    // Random date in 2023
    const randomDate = new Date(startDate.getTime() + Math.random() * 
                          (endDate.getTime() - startDate.getTime()));
    
    // Random burger consumption (1-20 per month)
    const burgersPerMonth = generateGaussianInt(8, 10, 1, 20);
    
    // Random favorite burger
    const favoriteBurger = burgerOptions[ generateGaussianInt(2, 3, 0, 4) ];
    
    // Random toppings (1-5 selections)
    const toppingsCount = generateGaussianInt(2, 2, 1, toppingOptions.length);
    const selectedToppings = toppingOptions
      .slice()
      .sort(() => generateGaussianInt(-1, 2))
      .slice(0, toppingsCount);
    
    // Random rating (1-5)
    const rating = generateGaussianInt(4, 2, 1, 5);
    
    // Random ranking
    const shuffledAspects = aspects.slice().sort(() => generateGaussianInt(-1, 2));
    
    responses.push({
      surveyId: SURVEY_ID,
      userId: "user_" + (1000 + i),
      answers: {
        q1: burgersPerMonth,
        q2: randomDate,
        q3: favoriteBurger,
        q4: selectedToppings,
        q5: rating,
        q6: shuffledAspects // ranking
      },
      createdAt: randomDate
    });
  }
  
  return responses;
}

print("Generating survey responses...");
const randomResponses = generateResponses(RESPONSES_COUNT);

print("Inserting responses into database...");
const result = db.responses.insertMany(randomResponses);

print(`Successfully inserted ${result.insertedCount} responses!`);
print("Data initialization complete.");