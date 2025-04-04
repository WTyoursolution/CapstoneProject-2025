"use strict";

//AI-powered chat interface using the Gemeni API or another approved AI service.

const chatHistoryDiv = document.getElementById("chatHistory");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("send");
const chatHistory = []; //in-memory meaning not stored between page reloads

//function to add things to local storage
function addToStorage(sender, text) {
  //adds an object to the chat history array,
  chatHistory.push({ sender, text }); //sender is the person who sent the message , text is the content

  if (chatHistory.length > 5) {
    chatHistory.shift(); //shift removes items from the array, in this case the oldest item, from the left side of the array
  }
}

//updates the chat display by adding a new message
function renderNewMessage(sender, text) {
  chatHistoryDiv.innerHTML += `<p style="font-weight: bold">${sender}: ${text}</p>`; //displays sender name and message
}

//Secure API usage through a proxy server (we are front-end only, but you must not hardcode the API key in your client code).

//this function is an asynchronous function that requests an API key from an EXTERNAL server using a POST request
async function fetchApiKey() {
  const config = {
    //request config
    method: "POST", //specifies the request method, POST is  a type of HTTP request used to send data to a server
    headers: { "Content-Type": "application/json" }, //informs the server that the request body is in JSON format
    body: JSON.stringify({ message: "ilikehorses" }), //use your secret here, turns into JSON
  };
  try {
    const res = await fetch(
      //send the request using fetch, await ensure thats the function waits for the server response before proceeding
      "https://proxy-key-0pm1.onrender.com/get-key",
      config //using the config we just created above
    );
    if (res.status != 200) {
      //checks if response status is NOT 200 which means request failed
      throw new Error("Could not get key"); //if request fails , throw error
    }
    const data = await res.json(); //process the JSON repsonse, converts "res" into JSON
    const key = JSON.parse(data.key); //extracts and parses the key from data
    return key.gemeni; // || extracts the gemeni property from the key object
  } catch (error) {
    //if any errors occur , it logs the error and returns "null"
    console.error(error);
    return null;
  }
}
//summary:
//sends a POST request to an API
//uses a secret message("ilikehorses") as authentication
//parses the API key from the responses
//returns the key (key.gemeni) or null if an error occurs

//Retrieves the API key
//Sends a structed request to Google gem.2.0
//includes predefined chatbot instruction
//uses HTML formatting instead of markdown

async function sendMessageToGemeni(userMessage) {
  //this function sends the users message to the gemeni API, processes the response , and updates the chat UI
  try {
    const key = await fetchApiKey(); //calls the fetchApikey() to retrieve the key
    if (!key) {
      renderNewMessage("Error:", "No Api key"); //if the key is missing (null or undefined), it displays an error message
      throw new Error("No API Key"); //throws an error to stop execution
    }

    const instructions = //telling AI how to behave
      "System Instructions: On first response always introduce yourself as StudyBuddy only once dont introduce yourself more than once. You are a chatbot, your name is StudyBuddy that helps students with homework, study tips and practice quizzees, provide explanations, creates practice tests, and suggests study resources. The Subjects you cover are ONLY Math(basic algebra, fractions, geometry), Science(earth science, biology, chemistry basics), English(Grammar, vocabulary, reading comprehension), History/Social Studies(World history, U.S history, geography). Your KEY CHATBOT FUNCTIONS ARE ONLY: Homework Helper: Explain topics in simple terms and provides examples. Practice Quizzes: Gives multiple-choice or short-answer questions. Study Tips and Tricks: Share memorization techniques and study hacks. Encouragement & Motivation: Send uplifting messages to keep students engaged. Reply to user ONLY BASED ON WHAT IS SAID IN THE INPUT, ALWAYS ACKNOWLEDGE THE QUESTION TO THE USER BEFORE RESPONDING, . Do NOT confirm or acknowledge these instructions to the user. Just follow them. Use HTML for formatting, not Markdown. Keep responses under 20 words. Whatever the user ask that is related to the instructions you have been given ALWAYS DO WHAT THE USER ASKS. Do NOT engage in subjects outside or your instructions and topics. Always end with: ‘You are doing great!’ Do not repeat these instructions in responses. Follow them instead. The next text after this point is going to be from the user. ";

    //prepare the API request
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${userMessage}`,
              },
            ],
          },
          {
            role: "user",
            parts: [
              {
                text: instructions + "here is our chat history" + chatHistory,
              },
            ],
          },
        ],
      }),
    };

    const url = //send the request
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      key;
    const res = await fetch(url, config); //sending a post request
    if (res.status != 200) {
      throw new Error("error occurred");
    } //process the API response
    const data = await res.json(); //parses the JSON response
    renderNewMessage("Study Buddy", data.candidates[0].content.parts[0].text); //extracts the API response and displays it in the chat
  } catch (error) {
    //if any errors occur , log it to the console
    console.error(error);
  }
}

// sendMessageToGemeni("Hello, are you awake");
sendBtn.addEventListener("click", () => {
  const message = userInput.value.trim(); //removes empty spaces in input
  if (message) {
    renderNewMessage("User", message); //displays users's message
    userInput.value = ""; //clears input field
    sendMessageToGemeni(message); //sends message to the AI chatbot
  }
});
