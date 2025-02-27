async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}

document.addEventListener("DOMContentLoaded", async () => {
  const tab = await getCurrentTab();

  const arxiv = new ArXiv();
  await arxiv.init(tab.url);
  arxiv.isValidURL();

  let notion = new Notion();
  await notion.init();

  const paper = new Paper();
  await paper.init(notion, arxiv.metadata);

  try {
    if (await paper.is_present()) {
      document.getElementById("present_message").style.display = "";
      document.getElementById("paper_title").innerHTML = paper.get_title();

      document.getElementById("update_button").style.display = "";
      document.getElementById("update_button").addEventListener("click", () => {
        paper.update();
      });
    } else {
      let projects = await notion.getProjects();
      projects.forEach((elem) => {
        let newOption = document.createElement("option");
        let optionText = document.createTextNode(elem['name']);
        newOption.appendChild(optionText);
        newOption.setAttribute("value", elem['id']);

        document.getElementById("project_select").appendChild(newOption);
      });
      document.getElementById("projects_list").style.display = "";

      document.getElementById("add_button").style.display = "";
      document.getElementById("add_button").addEventListener("click", () => {
        paper.add();
      });
    }
    document.getElementById("progress_bar").style.display = "none";
    document.getElementById("download_paper_container").style.display = "";
  } catch (err) {
    document.getElementById("error").innerHTML = err;
    console.log(err);
  }
});
