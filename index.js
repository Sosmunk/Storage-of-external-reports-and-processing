document.addEventListener('DOMContentLoaded', function() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    const repoMenu = document.getElementById('repo-menu');
    const dropdownRepoButton = document.getElementById('dropdown-repo-button');
    const filesList = document.getElementById('files-list');
    const folderTemplate = document.getElementById('folder-template');
    const uncapturedFileTemplate = document.getElementById('uncaptured-file-template');
    const capturedFileTemplate = document.getElementById('captured-file-template');
    const searchField = document.getElementById('search-field');
    const header = document.getElementById('files-list-header');
    const numberOfFilesElement = header.querySelector('p');
    const quitButton = document.getElementById('quit-button');

    const captureButton = document.getElementById('capture-button');
    const uncaptureButton = document.getElementById('uncapture-button');
    const pushButton = document.getElementById('push-button');
    const pullButton = document.getElementById('pull-button');

    let templates = [folderTemplate, uncapturedFileTemplate, capturedFileTemplate];
    let fileList = [];
    let activeRepo;
    let activeFile;
    createPage();

    function numeralFormatter(number, oneCase, twoFourCase, fiveNineCase) {
        if (10 <= number % 100 && number % 100 <= 20) return fiveNineCase;
        else if (number % 10 === 1) return oneCase;
        else if (2 <= number % 10 && number % 10 <= 4) return twoFourCase;
        else return fiveNineCase;
    }

    async function getRepositoriesList(url) {
        let request = await fetch(url, {
            headers: {
                'X-Session-Id': `${params.session_id}`,
            }
        });
        let response = await request.json();
        return response;
    }
    
    function createNewRepoItem(repoMenu, repository) {
        let repoItem = document.createElement('button');
        repoItem.classList.add('dropdown-item');
        repoItem.textContent = repository.name;
        repoItem.addEventListener('click', function() {
            activeRepo = repository;
            searchField.addEventListener('input', function() {updateHierarchy(activeRepo.files, searchField.value)});
            updateHierarchy(activeRepo.files);
        });
        repoMenu.prepend(repoItem);
    }
    
    function createNewHierarchyItem(filesList, templates, file) {
        let newFile;
        if (file.type === 'folder') {
            newFile = templates[0].content.cloneNode(true);
            let divContainer = newFile.querySelector('.folder');
            divContainer.addEventListener('dblclick', (event) => {
                updateHierarchy(file.files);
                updateBreadcrumb([file.name]);
            });
        } else if (file.type === 'file' && file.lock === false) {
            newFile = templates[1].content.cloneNode(true);
        } else if (file.type === 'file' && file.lock === true) {
            newFile = templates[2].content.cloneNode(true);
        }
        let fileNameElement = newFile.querySelector('p');
        fileNameElement.textContent = file.name;
        //fileList.push(newFile);
        filesList.appendChild(newFile);
    }
    
    function updateHierarchy(files=fileList, searchParam='') {
        dropdownRepoButton.textContent = activeRepo.name;
        filesList.innerHTML = '';
        let filesCount = 0;
        console.log(files);
        files.forEach(file => {
            console.log(file.name);
            if (searchParam == '' || file.name.includes(searchParam)) {
                createNewHierarchyItem(filesList, templates, file);
                filesCount++;
            }
        });

        let filesQuery = filesList.querySelectorAll('.box-row');
        for (let id in filesQuery) {
            console.log(filesQuery.keys());
            filesQuery[id].addEventListener('click', () => {
                activeFile = fileList[id];
                console.log(activeFile);
                updateActionMenu();
            });
        };

        numberOfFilesElement.textContent = `${filesCount} ${numeralFormatter(filesCount, 'файл', 'файла', 'файлов')}`;
    }

    function updateBreadcrumb(path=['main']) {
        const breadcrumb = document.getElementById('breadcrumb');
        const breadcrumbTemplate = document.getElementById('breadcrumb-template');
        path.forEach(piece => {
            let newBreadcrumbPiece = breadcrumbTemplate.content.cloneNode(true);
            if (piece === path[path.length - 1]) {
                newBreadcrumbPiece.querySelector('li').classList.add('active');
                ariaCurrent = 'page';
            } else {
                newBreadcrumbPiece.querySelector('li').addEventListener('click', function() {
                    updateBreadcrumb(path);
                });
            }
            newBreadcrumbPiece.querySelector('li').textContent = piece;
            breadcrumb.appendChild(newBreadcrumbPiece);
        });
    }

    function updateActionMenu(activeFile) {
        captureButton.disabled = false;
        uncaptureButton.disabled = true;
        pushButton.disabled = false;
        pullButton.disabled = true;

        captureButton.addEventListener('click', () => {
            lockFile()
            console.log('11111');
        });
    }

    async function lockFile() {
        let uri = 'http://5.165.236.244:9999/api/repositories/lock';
        let request = await axios.post(uri, 
            {
                repo_id: 1,
                filename: 'example.epf',
            }
        ).then(function(response) {

        })
    };
    

    async function unlockFile() {
        let request = await fetch('http://5.165.236.244:9999/api/repositories/unlock', {
            method: 'POST',
            headers: {
                'X-Session-Id': `${params.session_id}`,
            },
            body: {
                //repo_id: activeFile.id,
                //filename: activeFile.name,
                repo_id: 1,
                filename: 'example.epf',
            }
        });
    }

    function quitPage() {
        if (confirm('Вы действительно хотите выйти?')) window.location.replace("./login.html");
    }
    
    async function createPage() {
        let repositoryList = await getRepositoriesList('http://5.165.236.244:9999/api/repositories/list');
        repositoryList.repositories.slice().reverse().forEach(repo => {
            createNewRepoItem(repoMenu, repo);
        });
    
        activeRepo = repositoryList.repositories[0];
        fileList = activeRepo.files;

        updateHierarchy(fileList);
        updateBreadcrumb();
        quitButton.addEventListener('click', function() {quitPage()});
    }
});

