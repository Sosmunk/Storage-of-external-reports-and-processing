document.addEventListener('DOMContentLoaded', function() {
    const repoMenu = document.getElementById('repo-menu');
    const filesList = document.getElementById('files-list');
    const folderTemplate = document.getElementById('folder-template');
    const uncapturedFileTemplate = document.getElementById('uncaptured-file-template');
    const capturedFileTemplate = document.getElementById('captured-file-template');
    const searchField = document.getElementById('search-field');
    const header = document.getElementById('files-list-header');
    const numberOfFilesElement = header.querySelector('p');
    let templates = [folderTemplate, uncapturedFileTemplate, capturedFileTemplate];
    createPage();

    function numeralFormatter(number, oneCase, twoFourCase, fiveNineCase) {
        if (10 <= number % 100 && number % 100 <= 20) return fiveNineCase;
        else if (number % 10 === 1) return oneCase;
        else if (2 <= number % 10 && number % 10 <= 4) return twoFourCase;
        else return fiveNineCase;
    }

    async function getRepositoriesList(url) {
        let request = await fetch(url);
        let response = await request.json();
        return response;
    }
    
    function createNewRepoItem(repoMenu, repository) {
        let repoItem = document.createElement('button');
        repoItem.classList.add('dropdown-item');
        repoItem.textContent = repository.name;
        repoItem.addEventListener('click', function() {updateHierarchy(repository)});
        repoMenu.prepend(repoItem);
    }
    
    function createNewHierarchyItem(filesList, templates, file) {
        let newFile = templates[1].content.cloneNode(true);
        let fileNameElement = newFile.querySelector('p');
        fileNameElement.textContent = file;
        filesList.appendChild(newFile);
    }
    
    function updateHierarchy(activeRepo, searchParam='') {
        const filesCount = activeRepo.files.length;
        filesList.innerHTML = '';
        numberOfFilesElement.textContent = `${filesCount} ${numeralFormatter(filesCount, 'файл', 'файла', 'файлов')}`;
        activeRepo.files.forEach(file => {
            if (searchParam == '' || file.includes(searchParam))
            createNewHierarchyItem(filesList, templates, file)
        })
    }
    
    async function createPage() {
        let repositoryList = await getRepositoriesList('http://5.165.236.244:9999/api/repositories/list');
        repositoryList.repositories.slice().reverse().forEach(repo => {
            createNewRepoItem(repoMenu, repo);
        });
    
        let activeRepo = repositoryList.repositories[0];
        updateHierarchy(activeRepo);
    }
});

