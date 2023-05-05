function SaveChatGPTtoMD() {
  const chatMessages = document.querySelectorAll(".text-base");
  const pageTitle = document.title; const now = new Date(); const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
  let fileName = pageTitle + ' - ' + dateString + ".md";
  let markdownContent = "";
  for (const message of chatMessages) {
    
    if (message.querySelector(".whitespace-pre-wrap")) {
      let messageText = message.querySelector(".whitespace-pre-wrap").innerHTML;
      const sender = message.querySelector("img") ? "User" : "ChatGPT";
      // adds Escapes to non-MD
      messageText = messageText.replace(/_/gs, "\_").replace(/\*/gs, "\*").replace(/\^/gs, "\^").replace(/~/gs, "\~"); // I debated adding #, > (blockquotes), and | (table)
      // <p> element and everything in-line or inside
      messageText = messageText.replace(/<p>(.*?)<\/p>/g, function(match, p1) { return '\n' + p1.replace(/<b>(.*?)<\/b>/g, '**$1**').replace(/<\/?b>/g, "**").replace(/<\/?i>/g, "_").replace(/<code>/g, " `").replace(/<\/code>/g, "` ") + '\n'; });
      markdownContent += `**${sender}:** ${messageText.trim()}\n\n`;
    }
  }
// Remove Span with only class declaration, there is nesting? If there is more than 5 layers, just do it manually
  const repeatSpan = /<span class="[^"]*">([^<]*?)<\/span>/gs; markdownContent = markdownContent.replace(repeatSpan, "$1").replace(repeatSpan, "$1").replace(repeatSpan, "$1").replace(repeatSpan, "$1").replace(repeatSpan, "$1");
// Code Blocks, `text` is the default catch-all (because some commands/code-blocks aren't styled/identified by ChatGPT yet)
  markdownContent = markdownContent.replace(/<pre>.*?<code[^>]*>(.*?)<\/code>.*?<\/pre>/gs, function(match, p1) { const language = match.match(/class="[^"]*language-([^"\s]*)[^"]*"/); const languageIs = language ? language[1] : 'text'; return '\n``` ' + languageIs + '\n' + p1 + '```\n'; });
//it looks redundent, but trust me lol...
  markdownContent = markdownContent.replace(/<p>(.*?)<\/p>/g, function(match, p1) { return '\n' + p1.replace(/<b>(.*?)<\/b>/g, '**$1**').replace(/<\/?b>/g, "**").replace(/<\/?i>/g, "_").replace(/<code>/g, " `").replace(/<\/code>/g, "` ") + '\n'; });
  markdownContent = markdownContent.replace(/<div class="markdown prose w-full break-words dark:prose-invert dark">/gs, "").replace(/\r?\n?<\/div>\r?\n?/gs, "\n").replace(/\*\*ChatGPT:\*\* <(ol|ul)/gs, "**ChatGPT:**\n<$1").replace(/&gt;/gs, ">").replace(/&lt;/gs, "<").replace(/&amp;/gs, "&");
  const downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  downloadLink.href = URL.createObjectURL(new Blob([markdownContent], { type: "text/markdown" }));
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeScript') {
    (() => {SaveChatGPTtoMD();})();
  }
});
