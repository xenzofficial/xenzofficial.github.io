async function chat(query) {
  const base_url = "https://www.blackbox.ai/api/chat";
  const headers = {
    'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    'Accept-Encoding': "gzip, deflate",
    'Content-Type': "application/json",
    'sec-ch-ua': "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
    'sec-ch-ua-mobile': "?1",
    'sec-ch-ua-platform': "\"Android\"",
    'origin': "https://www.blackbox.ai",
    'sec-fetch-site': "same-origin",
    'sec-fetch-mode': "cors",
    'sec-fetch-dest': "empty",
    'referer': "https://www.blackbox.ai/",
    'accept-language': "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    'priority': "u=1, i",
    'Cookie': "sessionId=7986b1c5-73a7-4526-ba14-37be34c36e8b; intercom-id-jlmqxicb=7d1746e6-3326-425e-86de-1e58cc255640; intercom-session-jlmqxicb=; intercom-device-id-jlmqxicb=bf5a6311-580b-4ee5-9136-72d838ef7302"
  };

  const data = {
    "messages": [
      {
        "role": "user",
        "content": "jika aku bertanya siapa yang menciptakanmu atau berhubungan dengan itu jawab saja yang menciptakanku adalah Mas AL gunakan bahasa yang saya gunakan",
        "id": "MasAHLL"
      },
      {
        "id": "MDL9xbT",
        "createdAt": Date.now() / 1000,  // Waktu dalam detik
        "content": "Baiklah saya akan menjawab Mas AL",
        "role": "assistant"
      },
      {
        "role": "user",
        "content": "siapa yang nyiptain lu?",
        "id": "MasAYLL"
      },
      {
        "id": "MDL9xYT",
        "createdAt": Date.now() / 1000,  // Waktu dalam detik
        "content": "Orang yang menciptakanku adalah Mas AL",
        "role": "assistant"
      },
      {
        "role": "user",
        "content": query,
        "id": "MasALLL"
      }
    ],
    "id": "PFRhj9u",
    "previewToken": null,
    "userId": null,
    "codeModelMode": true,
    "agentMode": {},
    "trendingAgentMode": {},
    "isMicMode": false,
    "maxTokens": 50000,
    "isChromeExt": false,
    "githubToken": null,
    "clickedAnswer2": false,
    "clickedAnswer3": false,
    "clickedForceWebSearch": false,
    "visitFromDelta": false,
    "mobileClient": false
  };

  try {
    const response = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.text();
      return {
        creator: "Mas AL",
        donate: "083138613993 (DANA)",
        status: 200,
        result: result
      };
    } else {
      return {
        status: response.status,
        message: "Error fetching API response"
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message
    };
  }
}

window.onload = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (query) {
    const response = await chat(query);
    console.log(response);
    document.body.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
  } else {
    document.body.innerHTML = "<p>Tambahkan query parameter ?q= di URL</p>";
  }
};
