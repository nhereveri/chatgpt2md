chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeScript') {
    (function() {
      function toCamelCase(str) {
        return str
          .replace(/[^a-zA-Z0-9\s\u00C0-\u017F]+/g, '')
          .trim()
          .replace(/(?:^\w|[A-ZÀ-ÿ]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : /[a-zA-ZÀ-ÿ]/.test(str[index - 1]) ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, '');
      }


      function extractUsername() {
        const usernameElement = document.querySelector("nav > div:last-child > div > button > div:nth-child(2)");
        return usernameElement ? usernameElement.textContent.trim() : "User";
      }

      const pageTitle = toCamelCase(document.title);
      const now = new Date();
      const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
      const username = extractUsername();
      const CONFIG = {
        DOC_TITLE: pageTitle + '_' + dateString,
        encodeHTMLCHARS: false,
        DOC_USERNAME: username,
      };

      function htmlToMarkdownTables(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        const tables = div.getElementsByTagName("table");

        for (let i = 0; i < tables.length; i++) {
          const markdownTable = htmlToMarkdownTable(tables[i]);
          const markdownTableElement = document.createElement('div');
          markdownTableElement.innerHTML = markdownTable;

          tables[i].parentNode.replaceChild(markdownTableElement.firstChild, tables[i]);
        }

        return div.innerHTML;
      }

      function htmlToMarkdownTable(htmlTable) {
        let markdownTable = "\n\n";
        const rows = htmlTable.getElementsByTagName("tr");

        // Obtiene el encabezado de la tabla
        const headerCells = rows[0].getElementsByTagName("th");
        for (let i = 0; i < headerCells.length; i++) {
          markdownTable += "|" + headerCells[i].textContent.trim();
        }
        markdownTable += "|\n";

        // Agrega una línea separadora
        for (let i = 0; i < headerCells.length; i++) {
          markdownTable += "| --- ";
        }
        markdownTable += "|\n";

        // Obtiene las filas de datos
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].getElementsByTagName("td");
          for (let j = 0; j < cells.length; j++) {
            markdownTable += "|" + cells[j].textContent.trim();
          }
          markdownTable += "|\n";
        }
        return markdownTable;
      }

      function convertList(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        const uls = div.getElementsByTagName("ul");
        const ols = div.getElementsByTagName("ol");

        for (const list of [...uls, ...ols]) {
          const type = list.tagName === "OL" ? "ol" : "ul";
          const items = [...list.getElementsByTagName("li")].map((li) => {
            return type === "ol" ? "1. " + li.textContent.trim() : "- " + li.textContent.trim();
          });
          const markdownList = "\n" + items.join("\n") + "\n";
          const markdownListElement = document.createElement("div");
          markdownListElement.innerHTML = markdownList;

          list.parentNode.replaceChild(markdownListElement.firstChild, list);
        }

        return div.innerHTML;
      }

      function convertLinks(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        const links = div.getElementsByTagName("a");

        for (const link of links) {
          const markdownLink = `[${link.textContent.trim()}](${link.href})`;
          const markdownLinkElement = document.createElement("div");
          markdownLinkElement.innerHTML = markdownLink;

          link.parentNode.replaceChild(markdownLinkElement.firstChild, link);
        }

        return div.innerHTML;
      }

      function h(html) {
        html = convertLinks(html);
        html = convertList(html);
        html = htmlToMarkdownTables(html);
        return html
          .replace(/<p>/g, '\n\n')
          .replace(/<\/p>/g, '')
          .replace(/<b>/g, '**')
          .replace(/<\/b>/g, '**')
          .replace(/<i>/g, '_')
          .replace(/<\/i>/g, '_')
          .replace(/<code[^>]*>/g, (match) => {
            const lm = match.match(/class="[^"]*language-([^"]*)"/);
            return lm ? '\n```' + lm[1] + '\n' : '```';
          })
          .replace(/<\/code[^>]*>/g, '```')
          .replace(/<[^>]*>/g, '')
          .replace(/Copy code/g, '')
          .replace(/This content may violate our content policy. If you believe this to be in error, please submit your feedback — your input will aid our research in this area./g, '')
          .trim();
      }

      (()=>{
        const e = document.querySelectorAll(".text-base");
        let t = "";
        for (const s of e) {
          if (s.querySelector(".whitespace-pre-wrap")) {
            t += `**${s.querySelector('img') ? CONFIG.DOC_USERNAME : 'ChatGPT'}**:\n${h(s.querySelector(".whitespace-pre-wrap").innerHTML)}\n\n`;
          }
        }
        const o = document.createElement("a");
        o.download = CONFIG.DOC_TITLE + ".md";
        o.href = URL.createObjectURL(new Blob([(CONFIG.encodeHTMLCHARS) ? t : t.replace(/\&gt\;/g, ">").replace(/\&lt\;/g, "<")]));
        o.style.display = "none";
        document.body.appendChild(o);
        o.click();
      })();
    })();
    setTimeout(() => {
      console.log("La extensión ha finalizado su ejecución.");
      chrome.runtime.sendMessage({ action: 'resetExtensionState' });
    }, 5000);
  }
});
