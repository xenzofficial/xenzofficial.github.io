function chat(query, callback) {
  const proxy = "https://cors-anywhere.herokuapp.com/";
  const base_url = "https://www.blackbox.ai/api/chat";
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", base_url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
  xhr.setRequestHeader("sec-ch-ua", "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"");
  xhr.setRequestHeader("sec-ch-ua-mobile", "?1");
  xhr.setRequestHeader("sec-ch-ua-platform", "\"Android\"");
  xhr.setRequestHeader("origin", "https://www.blackbox.ai");
  xhr.setRequestHeader("referer", "https://www.blackbox.ai/");
  xhr.setRequestHeader("accept-language", "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7");
  xhr.setRequestHeader("Cookie", "sessionId=7986b1c5-73a7-4526-ba14-37be34c36e8b");

  const data = JSON.stringify({
    "messages": [
      {
        "role": "user",
        "content": "Siapa yang menciptakanmu?",
        "id": "MasAHLL"
      },
      {
        "role": "user",
        "content": query,
        "id": "MasALLL"
      }
    ]
  });

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {  // 4 = DONE
      if (xhr.status === 200) {
        const result = xhr.responseText;
        callback({
          creator: "Mas AL",
          donate: "083138613993 (DANA)",
          status: 200,
          result: result
        });
      } else {
        callback({
          status: xhr.status,
          message: "Error fetching API response"
        });
      }
    }
  };

  xhr.onerror = function() {
    callback({
      status: 500,
      message: "Failed to fetch"
    });
  };

  xhr.send(data);
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q'); 

  if (query) {
    chat(query, function(response) {
      console.log(response);  
      document.body.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;  
    });
  } else {
    document.body.innerHTML = "<p>Tambahkan query parameter ?q= di URL</p>";
  }
};
