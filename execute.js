function scrapeGPT() {
  // if a network errors occurs on the bottom of page, than you have to add one extra div like this: 
  let selector = "#__next > div.overflow-hidden.w-full.h-full.relative > div.flex.h-full.flex-1.flex-col.md\\:pl-\\[260px\\] > main > div.flex-1.overflow-hidden > div > div";
  let lengthConversation = document.querySelectorAll(selector + " > div").length;
  const lengthConversation2 = document.querySelectorAll(selector + " > div > div").length;
  console.log(lengthConversation, lengthConversation2);
  if(lengthConversation2 > lengthConversation) {
    selector += " > div";
    lengthConversation = lengthConversation2;
  }
    
  const result = [];
  for(let i=0;i<lengthConversation;i++){
    const question = document.querySelectorAll(selector + ` > div:nth-child(${i+1}) > div > div:nth-child(2) > div `)?.[0]?.textContent;
    const answer = [...document.querySelectorAll(selector + ` > div:nth-child(${i+1}) > div > div:nth-child(2) > div > div > div *`)]
    .filter(x => ["P","PRE","OL","UL"].includes(x.nodeName))
    .map(x => {
      if(x.nodeName === "OL") return [...x.children].map((x, index) => (index + 1) + ". " + removeQuotes(x.textContent)).join("\n")
      if(x.nodeName === "UL") return [...x.children].map(x => removeQuotes(x.textContent)).join("\n")
      if(x.nodeName === "PRE") return x.textContent.slice('Copy code'.length);
      return x.textContent
    })
    .join("\n\n");
  
    result.push(answer || question);
  }
  return result;
}

function removeQuotes(text) {
  return text.replace(/^“|”|"/g, '').replace(/“|”|"$/g, '');
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadGPT(title) {
  const texts = scrapeGPT();
  const pre = `
------------------------------------------------------------
  
  `
  download('GPT ' + title + " " + texts[0].slice(0,60) + ".txt", pre + texts.join("\n\n------------------------------------------------------------\n\n"));
}

function downloadGPTFilePerQuestion(title) {
  const texts = scrapeGPT();
  const pre = `

------------------------------------------------------------
  
  `
  for(let i=0;i<texts.length/2 - 1;i++){
    download('GPT ' + title + ": " + texts[i*2].slice(0,60) + `.txt`, pre + texts[i*2] + pre + texts[i*2+1]);
  }
}

function main() {
  const title = prompt("What filename do you want to use? (only text, not .txt)", document.title);
  if(title === null) return;
  downloadGPT(title);
  // if(scrapeGPT().length > 2)
  //   downloadGPTFilePerQuestion(title);
}

main();