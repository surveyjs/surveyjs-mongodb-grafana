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

db.surveys.insertMany([{
  _id: "burger_survey_2023",
  id: "burger_survey_2023",
  name: "Burger Satisfaction Survey",
  json: {
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
  }
}, {
  _id: "1",
  id: "1",
  "name": "Product Feedback Survey",
  "json": {
      "pages": [{
      "elements": [{
          "type": "matrix",
          "name": "Quality",
          "title": "Please indicate if you agree or disagree with the following statements",
          "columns": [{
          "value": 1,
          "text": "Strongly disagree"
          }, {
          "value": 2,
          "text": "Disagree"
          }, {
          "value": 3,
          "text": "Neutral"
          }, {
          "value": 4,
          "text": "Agree"
          }, {
          "value": 5,
          "text": "Strongly agree"
          }],
          "rows": [{
          "value": "affordable",
          "text": "Product is affordable"
          }, {
          "value": "does what it claims",
          "text": "Product does what it claims"
          }, {
          "value": "better then others",
          "text": "Product is better than other products on the market"
          }, {
          "value": "easy to use",
          "text": "Product is easy to use"
          }]
      }, {
          "type": "rating",
          "name": "satisfaction",
          "title": "How satisfied are you with the product?",
          "mininumRateDescription": "Not satisfied",
          "maximumRateDescription": "Completely satisfied"
      }, {
          "type": "rating",
          "name": "recommend friends",
          "visibleIf": "{satisfaction} > 3",
          "title": "How likely are you to recommend the product to a friend or colleague?",
          "mininumRateDescription": "Won't recommend",
          "maximumRateDescription": "Will recommend"
      }, {
          "type": "comment",
          "name": "suggestions",
          "title": "What would make you more satisfied with the product?"
      }]
      }, {
      "elements": [{
          "type": "radiogroup",
          "name": "price to competitors",
          "title": "Compared to our competitors, do you feel the product is",
          "choices": [
          "Less expensive",
          "Priced about the same",
          "More expensive",
          "Not sure"
          ]
      }, {
          "type": "radiogroup",
          "name": "price",
          "title": "Do you feel our current price is merited by our product?",
          "choices": [
          "correct|Yes, the price is about right",
          "low|No, the price is too low",
          "high|No, the price is too high"
          ]
      }, {
          "type": "multipletext",
          "name": "pricelimit",
          "title": "What is the... ",
          "items": [{
          "name": "mostamount",
          "title": "Most amount you would pay for a product like ours"
          }, {
          "name": "leastamount",
          "title": "The least amount you would feel comfortable paying"
          }]
      }]
      }, {
      "elements": [{
          "type": "text",
          "name": "email",
          "title": 'Thank you for taking our survey. Please enter your email address and press the "Submit" button.'
      }]
      }]
  }
}, {
  _id: "2",
  id: "2",
  "name": "Customer and their partner income survey",
  "json": {
      "completeText": "Finish",
      "pageNextText": "Continue",
      "pagePrevText": "Previous",
      "pages": [{
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "html",
          "name": "income_intro",
          "html":
              "Income. In this section, you will be asked about your current employment status and other ways you and your partner receive income. It will be handy to have the following in front of you: payslip (for employment details), latest statement from any payments (from Centrelink or other authority), a current Centrelink Schedule for any account-based pension from super, annuities, or other income stream products that you may own. If you don't have a current one, you can get these schedules by contacting your income stream provider."
          }],
          "name": "panel1"
      }],
      "name": "page0"
      }, {
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "radiogroup",
          "choices": [
              "Married",
              "In a registered relationship",
              "Living with my partner",
              "Widowed",
              "Single"
          ],
          "name": "maritalstatus_c",
          "title": " "
          }],
          "name": "panel13",
          "title": "What is your marital status?"
      }],
      "name": "page1"
      }, {
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "panel",
          "elements": [{
              "type": "radiogroup",
              "choices": [{
              "value": "1",
              "text": "Yes"
              }, {
              "value": "0",
              "text": "No"
              }],
              "colCount": 2,
              "isRequired": true,
              "name": "member_receives_income_from_employment",
              "title": " "
          }, {
              "type": "checkbox",
              "name": "member_type_of_employment",
              "visible": false,
              "visibleIf": "{member_receives_income_from_employment} =1",
              "title": "  ",
              "isRequired": true,
              "choices": [
              "Self-employed",
              "Other types of employment"
              ]
          }],
          "name": "panel2",
          "title": "You"
          }, {
          "type": "panel",
          "elements": [{
              "type": "radiogroup",
              "choices": [{
              "value": "1",
              "text": "Yes"
              }, {
              "value": "0",
              "text": "No"
              }],
              "colCount": 2,
              "isRequired": true,
              "name": "partner_receives_income_from_employment",
              "title": " "
          }, {
              "type": "checkbox",
              "name": "partner_type_of_employment",
              "visible": false,
              "visibleIf": "{partner_receives_income_from_employment} =1",
              "title": " ",
              "isRequired": true,
              "choices": [
              "Self-employed",
              "Other types of employment"
              ]
          }],
          "name": "panel1",
          "startWithNewLine": false,
          "title": "Your Partner",
          "visibleIf":
              "{maritalstatus_c} = 'Married' or {maritalstatus_c} = 'In a registered relationship' or {maritalstatus_c} = 'Living with my partner'"
          }],
          "name": "panel5",
          "title": "Do you and/or your partner currently receive income from employment?"
      }],
      "name": "page2"
      }, {
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "panel",
          "elements": [{
              "type": "paneldynamic",
              "minPanelCount": 1,
              "name": "member_array_employer_names",
              "valueName": "member_array_employer",
              "title": "Enter information about your employers",
              "panelAddText": "Add another employer",
              "panelCount": 1,
              "templateElements": [{
              "type": "text",
              "name": "member_employer_name",
              "valueName": "name",
              "title": "Employer name"
              }]
          }],
          "name": "panel2",
          "title": "You",
          "visible": false,
          "visibleIf": "{member_type_of_employment} contains 'Other types of employment'"
          }, {
          "type": "panel",
          "elements": [{
              "type": "paneldynamic",
              "minPanelCount": 1,
              "name": "partner_array_employer_names",
              "valueName": "partner_array_employer",
              "title": "Enter information about employers of your partner",
              "panelAddText": "Add another employer",
              "panelCount": 1,
              "templateElements": [{
              "type": "text",
              "name": "partner_employer_name",
              "valueName": "name",
              "title": "Employer name"
              }]
          }],
          "name": "panel8",
          "startWithNewLine": false,
          "title": "Your Partner",
          "visible": false,
          "visibleIf":
              "{partner_type_of_employment} contains 'Other types of employment'"
          }],
          "name": "panel6",
          "title": "Employers"
      }],
      "name": "page3.1",
      "visible": false,
      "visibleIf":
          "{member_type_of_employment} contains 'Other types of employment' or {partner_type_of_employment} contains 'Other types of employment'"
      }, {
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "panel",
          "elements": [{
              "type": "paneldynamic",
              "renderMode": "progressTop",
              "allowAddPanel": false,
              "allowRemovePanel": false,
              "name": "member_array_employer_info",
              "title": "Your employers",
              "valueName": "member_array_employer",
              "panelCount": 1,
              "templateElements": [{
              "type": "panel",
              "name": "panel_member_employer_address",
              "title": "Contacts",
              "elements": [{
                  "type": "text",
                  "name": "member_employer_address",
                  "valueName": "address",
                  "title": "Address:"
              }, {
                  "type": "text",
                  "name": "member_employer_phone",
                  "valueName": "phone",
                  "title": "Phone number:"
              }, {
                  "type": "text",
                  "name": "member_employer_abn",
                  "valueName": "abn",
                  "title": "ABN:"
              }]
              }, {
              "type": "panel",
              "name": "panel_member_employer_role",
              "title": "Are you a full time worker?",
              "elements": [{
                  "type": "radiogroup",
                  "choices": [
                  "Full-time",
                  "Part-time",
                  "Casual",
                  "Seasonal"
                  ],
                  "name": "member_employer_role",
                  "title": " ",
                  "valueName": "role"
              }]
              }, {
              "type": "panel",
              "name": "panel_member_employer_hours_work",
              "title": "How many hours do you work?",
              "elements": [{
                  "type": "text",
                  "inputType": "number",
                  "name": "member_employer_hours_worked",
                  "valueName": "hours_worked",
                  "title": "Hours:"
              }, {
                  "type": "dropdown",
                  "name": "member_employer_hours_worked_frequency",
                  "title": "Work frequency:",
                  "valueName": "hours_worked_frequency",
                  "startWithNewLine": false,
                  "defaultValue": "Day",
                  "choices": [
                  "Day",
                  "Week",
                  "Fortnight",
                  "Month",
                  "Year"
                  ]
              }]
              }, {
              "type": "panel",
              "name": "panel_member_employer_income",
              "title": "What is your income?",
              "elements": [{
                  "type": "text",
                  "inputType": "number",
                  "name": "member_employer_income",
                  "valueName": "income",
                  "title": "Income:"
              }, {
                  "type": "dropdown",
                  "name": "member_employer_income_frequency",
                  "title": "Income frequency:",
                  "valueName": "income_frequency",
                  "startWithNewLine": false,
                  "defaultValue": "Month",
                  "choices": [
                  "Day",
                  "Week",
                  "Fortnight",
                  "Month",
                  "Year"
                  ]
              }]
              }],
          "templateTitle": "Employer name: {panel.name}"
          }],
          "name": "panel17",
          "title": "You",
          "visibleIf": "{member_type_of_employment} contains 'Other types of employment'"
      }, {
          "type": "panel",
          "elements": [{
          "type": "paneldynamic",
          "renderMode": "progressTop",
          "allowAddPanel": false,
          "allowRemovePanel": false,
          "name": "partner_array_employer_info",
          "title": "Employers",
          "valueName": "partner_array_employer",
          "panelCount": 1,
          "templateElements": [{
              "type": "panel",
              "name": "panel_partner_employer_address",
              "title": "Contacts",
              "elements": [{
              "type": "text",
              "name": "partner_employer_address",
              "valueName": "address",
              "title": "Address:"
              }, {
              "type": "text",
              "name": "partner_employer_phone",
              "valueName": "phone",
              "title": "Phone number:"
              }, {
              "type": "text",
              "name": "partner_employer_abn",
              "valueName": "abn",
              "title": "ABN:"
              }]
          }, {
              "type": "panel",
              "name": "panel_partner_employer_role",
              "title": "Are you a full time worker?",
              "elements": [{
              "type": "radiogroup",
              "choices": [
                  "Full-time",
                  "Part-time",
                  "Casual",
                  "Seasonal"
              ],
              "name": "partner_employer_role",
              "title": "Your role",
              "valueName": "role"
              }]
          }, {
              "type": "panel",
              "name": "panel_partner_employer_hours_work",
              "title": "How many hours do you work?",
              "elements": [{
              "type": "text",
              "inputType": "number",
              "name": "partner_employer_hours_worked",
              "valueName": "hours_worked",
              "title": "Hours:"
              }, {
              "type": "dropdown",
              "name": "partner_employer_hours_worked_frequency",
              "valueName": "hours_worked_frequency",
              "title": "Work frequency:",
              "startWithNewLine": false,
              "defaultValue": "Day",
              "choices": [
                  "Day",
                  "Week",
                  "Fortnight",
                  "Month",
                  "Year"
              ]
              }]
          }, {
              "type": "panel",
              "name": "panel_partner_employer_income",
              "title": "What is your income?",
              "elements": [{
              "type": "text",
              "inputType": "number",
              "name": "partner_employer_income",
              "valueName": "income",
              "title": "Income:"
              }, {
              "type": "dropdown",
              "name": "partner_employer_income_frequency",
              "valueName": "income_frequency",
              "title": "Income frequency:",
              "startWithNewLine": false,
              "defaultValue": "Month",
              "choices": [
                  "Day",
                  "Week",
                  "Fortnight",
                  "Month",
                  "Year"
              ]
              }]
          }],
          "templateTitle": "Employer name: {panel.name}"
          }],
          "name": "panel18",
          "startWithNewLine": false,
          "title": "You partner",
          "visibleIf": "{partner_type_of_employment} contains 'Other types of employment'"
      }],
      "name": "panel16",
      "title": "Enter information about your employers"
      }],
      "name": "page3.2",
      "visibleIf":
      "{member_type_of_employment} contains 'Other types of employment' or {partner_type_of_employment} contains 'Other types of employment'"
  }, {
      "elements": [{
      "type": "panel",
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "radiogroup",
          "choices": [{
              "value": "1",
              "text": "Yes"
          }, {
              "value": "0",
              "text": "No"
          }],
          "colCount": 2,
          "isRequired": true,
          "name": "member_receive_fringe_benefits",
          "title": " "
          }, {
          "type": "panel",
          "elements": [{
              "type": "text",
              "name": "member_fringe_benefits_type"
          }, {
              "type": "text",
              "name": "member_fringe_benefits_value"
          }, {
              "type": "radiogroup",
              "choices": ["Grossed up", "Not grossed up"],
              "name": "member_fringe_benefits_grossing"
          }],
          "name": "panel11",
          "visible": false,
          "visibleIf": "{member_receive_fringe_benefits} = 1"
          }],
          "name": "panel2",
          "title": "You",
          "visible": false,
          "visibleIf": "{member_type_of_employment} contains 'Other types of employment'"
      }, {
          "type": "panel",
          "elements": [{
          "type": "radiogroup",
          "choices": [{
              "value": "1",
              "text": "Yes"
          }, {
              "value": "0",
              "text": "No"
          }],
          "colCount": 2,
          "isRequired": true,
          "name": "partner_receive_fringe_benefits",
          "title": " "
          }, {
          "type": "panel",
          "elements": [{
              "type": "text",
              "name": "partner_fringe_benefits_type"
          }, {
              "type": "text",
              "name": "partner_fringe_benefits_value"
          }, {
              "type": "radiogroup",
              "choices": ["Grossed up", "Not grossed up"],
              "name": "partner_fringe_benefits_grossing"
          }],
          "name": "panel12",
          "visible": false,
          "visibleIf": "{partner_receive_fringe_benefits} = 1"
          }],
          "name": "panel1",
          "startWithNewLine": false,
          "title": "Your Partner",
          "visible": false,
          "visibleIf": "{partner_type_of_employment} contains 'Other types of employment'"
      }],
      "name": "panel9",
      "title": "Do any of your employers provide you with fringe benefits?"
      }],
      "name": "page4",
      "visible": false,
      "visibleIf":
          "{member_type_of_employment} contains 'Other types of employment' or {partner_type_of_employment} contains 'Other types of employment'"
      }, {
      "elements": [{
          "type": "panel",
          "elements": [{
          "type": "panel",
          "elements": [{
              "type": "radiogroup",
              "choices": [{
              "value": "1",
              "text": "Yes"
              }, {
              "value": "0",
              "text": "No"
              }],
              "colCount": 2,
              "isRequired": true,
              "name": "member_seasonal_intermittent_or_contract_work",
              "title": " "
          }],
          "name": "panel2",
          "title": "You",
          "visible": false,
          "visibleIf": "{member_receives_income_from_employment} = 1"
          }, {
          "type": "panel",
          "elements": [{
              "type": "radiogroup",
              "choices": [{
              "value": "1",
              "text": "Yes"
              }, {
              "value": "0",
              "text": "No"
              }],
              "colCount": 2,
              "isRequired": true,
              "name": "partner_seasonal_intermittent_or_contract_work",
              "title": " "
          }],
          "name": "panel1",
          "startWithNewLine": false,
          "title": "Your Partner",
          "visible": false,
          "visibleIf": "{partner_receives_income_from_employment} =1 "
          }],
          "name": "panel10",
          "title": "In the last 6 months, have you done any seasonal, intermittent or contract work?"
      }],
      "name": "page5",
      "visible": false,
      "visibleIf": "{member_receives_income_from_employment} = 1 or {partner_receives_income_from_employment} =1 "
      }],
      "requiredText": "",
      "showQuestionNumbers": "off",
      "storeOthersAsComment": false
  }
}]);

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
      q1: 4,
      q2: new Date("2023-10-14"),
      q3: "Classic Cheeseburger",
      q4: ["Lettuce", "Tomato", "Onion", "Pickles"],
      q5: 4,
      q6: [ "Price", "Freshness", "Taste", "Portion Size", "Presentation" ]
    },
    createdAt: new Date("2023-10-16T11:15:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user003",
    answers: {
      q1: 12,
      q2: new Date("2023-10-16"),
      q3: "Mushroom Swiss",
      q4: ["Mushrooms", "Swiss Cheese", "Onion"],
      q5: 3,
      q6: [ "Freshness", "Taste", "Portion Size", "Price", "Presentation" ]
    },
    createdAt: new Date("2023-10-16T14:20:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user004",
    answers: {
      q1: 6,
      q2: new Date("2023-10-13"),
      q3: "Double Trouble",
      q4: ["Bacon", "Extra Cheese", "Jalapenos"],
      q5: 5,
      q6: [ "Portion Size", "Taste", "Price", "Presentation", "Freshness" ]
    },
    createdAt: new Date("2023-10-16T15:45:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user005",
    answers: {
      q1: 3,
      q2: new Date("2023-10-16"),
      q3: "Veggie Deluxe",
      q4: ["Avocado", "Tomato", "Lettuce"],
      q5: 4,
      q6: [ "Presentation", "Freshness", "Taste", "Portion Size", "Price" ]
    },
    createdAt: new Date("2023-10-16T16:30:00Z")
  }
];

db.responses.insertMany(responses);

// const burgerSurvey = db.surveys.findOne({ _id: "burger_survey_2023" });
// const questions = burgerSurvey.questions;
const questions = [
    {
      id: "q1",
      text: "How many burgers do you consume per month?",
      type: "number",
      min: 0,
      max: 100
    },
    {
      id: "q2",
      text: "When was your last burger purchase?",
      type: "date"
    },
    {
      id: "q3",
      text: "Which burger is your favorite?",
      type: "single_choice",
      options: ["Classic Cheeseburger", "BBQ Bacon", "Mushroom Swiss", "Veggie Deluxe", "Double Trouble"]
    },
    {
      id: "q4",
      text: "What toppings do you prefer? (Select all that apply)",
      type: "multiple_choice",
      options: ["Lettuce", "Tomato", "Onion", "Pickles", "Bacon", "Extra Cheese", "Avocado", "Jalapenos"]
    },
    {
      id: "q5",
      text: "Rate your overall satisfaction with our burgers",
      type: "rating",
      min: 1,
      max: 5,
      labels: {
        1: "Very Dissatisfied",
        2: "Dissatisfied",
        3: "Neutral",
        4: "Satisfied",
        5: "Very Satisfied"
      }
    },
    {
      id: "q6",
      text: "Rank the following aspects by importance (1 = Most Important)",
      type: "ranking",
      options: ["Taste", "Price", "Portion Size", "Freshness", "Presentation"]
    }
];

questions.forEach(question => {
  const stats = {};
  
  switch(question.type) {
    case "number":
      const numResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: null,
          avg: { $avg: `$answers.${question.id}` },
          min: { $min: `$answers.${question.id}` },
          max: { $max: `$answers.${question.id}` }
        }}
      ]).next();
      stats.value = numResult;
      break;
      
    case "single_choice":
      const choiceResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.id}`,
          count: { $sum: 1 }
        }}
      ]).toArray();
      stats.options = choiceResult;
      break;
      
    case "rating":
      const ratingResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.id}`,
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
      questionId: question.id
    },
    data: stats,
    updatedAt: new Date()
  });
});

print("Burger survey initialized successfully!");

// Configuration
const SURVEY_ID = 'burger_survey_2023';
const RESPONSES_COUNT = 1000;

// Survey options
const burgerOptions = [
  "Classic Cheeseburger", 
  "BBQ Bacon", 
  "Mushroom Swiss", 
  "Veggie Deluxe", 
  "Double Trouble"
];

const toppingOptions = [
  "Lettuce", "Tomato", "Onion", "Pickles", 
  "Bacon", "Extra Cheese", "Avocado", "Jalapenos"
];

const aspects = ["Taste", "Price", "Portion Size", "Freshness", "Presentation"];

function generateGaussian(mean, std) {
  var _2PI = Math.PI * 2;
  var u1 = Math.random();
  var u2 = Math.random();
  
  var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2);
  var z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2);

  return z0 * std + mean;
}

// Generate random responses
function generateResponses(count) {
  const responses = [];
  const startDate = new Date(2023, 0, 1); // Jan 1, 2023
  const endDate = new Date(2023, 11, 31); // Dec 31, 2023
  
  for (let i = 0; i < count; i++) {
    // Random date in 2023
    const randomDate = new Date(startDate.getTime() + Math.random() * 
                          (endDate.getTime() - startDate.getTime()));
    
    // Random burger consumption (0-30 per month)
    const burgersPerMonth = Math.floor(Math.random() * 31);
    
    // Random favorite burger
    const favoriteBurger = burgerOptions[
      Math.floor(generateGaussian(0, 1) * burgerOptions.length)
    ];
    
    // Random toppings (1-5 selections)
    const toppingsCount = 1 + Math.floor(generateGaussian(0, 1) * 5);
    const selectedToppings = toppingOptions
      .slice()
      .sort(() => 0.5 - generateGaussian(0, 1))
      .slice(0, toppingsCount);
    
    // Random rating (1-5)
    const rating = 1 + Math.floor(Math.random() * 5);
    
    // Random ranking
    const shuffledAspects = aspects.slice().sort(() => 0.5 - generateGaussian(0, 1));
    // const ranking = {};
    // shuffledAspects.forEach((aspect, index) => {
    //   ranking[aspect] = index + 1;
    // });
    
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

// Main execution
print("Generating survey responses...");
const randomResponses = generateResponses(RESPONSES_COUNT);

print("Inserting responses into database...");
const result = db.responses.insertMany(randomResponses);

print(`Successfully inserted ${result.insertedCount} responses!`);
print("Data initialization complete.");

// Added another demo responses (from old demo)
db.responses.insertMany([
    { surveyId: "1", userId: "user_1001", createdAt: new Date("2023-10-13T16:30:00Z"), answers: { "Quality": { "affordable": "5", "better then others": "5", "does what it claims": "5", "easy to use": "5" }, "satisfaction": 5, "recommend friends": 5, "suggestions": "I am happy!", "price to competitors": "Not sure", "price": "low", "pricelimit": { "mostamount": "100", "leastamount": "100" } } },
    { surveyId: "1", userId: "user_1001", createdAt: new Date("2023-10-13T16:30:00Z"), answers: { "Quality": { "affordable": "3", "does what it claims": "2", "better then others": "2", "easy to use": "3" }, "satisfaction": 3, "suggestions": "better support", "price to competitors": "Not sure", "price": "high", "pricelimit": { "mostamount": "60", "leastamount": "10" } } },
    { surveyId: "2", userId: "user_1001", createdAt: new Date("2023-10-13T16:30:00Z"), answers: { "member_array_employer": [{}], "partner_array_employer": [{}], "maritalstatus_c": "Married", "member_receives_income_from_employment": "0", "partner_receives_income_from_employment": "0" } },
    { surveyId: "2", userId: "user_1001", createdAt: new Date("2023-10-13T16:30:00Z"), answers: { "member_array_employer": [{}], "partner_array_employer": [{}], "maritalstatus_c": "Single", "member_receives_income_from_employment": "1", "member_type_of_employment": ["Self-employed"], "member_seasonal_intermittent_or_contract_work": "0" } },
]);
