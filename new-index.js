class TreeNode {
    constructor(key, value, type, lock = false, parent = null, last_commit = null) {
        this.key = key;
        this.value = value;
        this.type = type;
        this.lock = lock;
        this.parent = parent;
        this.last_commit = last_commit;
        this.children = [];
    }
  
    get isLeaf() {
        return this.children.length === 0;
    }

    get hasParent() {
        return this.parent !== null;
    }
  
    get hasChildren() {
        return !this.isLeaf;
    }
}


function numeralFormatter(number, oneCase, twoFourCase, fiveNineCase) {
    if (10 <= number % 100 && number % 100 <= 20) return fiveNineCase;
    else if (number % 10 === 1) return oneCase;
    else if (2 <= number % 10 && number % 10 <= 4) return twoFourCase;
    else return fiveNineCase;
}

function blobToFile(theBlob, fileName){
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}


function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}


const ip = "5.165.236.244:9999";

const repoMenu = document.getElementById('repo-menu');
const dropdownRepoButton = document.getElementById('dropdown-repo-button');
const filesList = document.getElementById('files-list');

const emptyTemplate = document.getElementById('empty-template');
const repoTemplate = document.getElementById('repo-template');
const parentTemplate = document.getElementById('parent-template');
const folderTemplate = document.getElementById('folder-template');
const uncapturedFileTemplate = document.getElementById('uncaptured-file-template');
const capturedFileTemplate = document.getElementById('captured-file-template');
const fileCommitsTableTemplate = document.getElementById('file-commits-table-template');
const fileCommitTemplate = document.getElementById('file-commit-template');

const unlockedFileDescription = document.getElementById('unlocked-file-description');
const lockedFileDescription = document.getElementById('locked-file-description');

const searchField = document.getElementById('search-field');
const header = document.getElementById('files-list-header');
const numberOfFilesElement = header.querySelector('p');
const quitButton = document.getElementById('quit-button');

const captureButton = document.getElementById('capture-button');
const uncaptureButton = document.getElementById('uncapture-button');
const pushButton = document.getElementById('push-button');
const pullButton = document.getElementById('pull-button');

const descriptionFileName = document.getElementById('description-file-name');
const descriptionWrapper = document.getElementById('description-wrapper');

const descriptionSectionButton =  document.getElementById('description-section-button');
const codeSectionButton = document.getElementById('code-section-button');
const commitSectionButton = document.getElementById('commit-section-button');

const fileInput = document.getElementById('file-input');
const fileInputLabel = document.getElementById('file-input-label');
const repoIdInput = document.getElementById('repo_id-input');
const filenameInput = document.getElementById('filename-input');
const commitTextInput = document.getElementById('commit-text-input');
const sendCommitButton = document.getElementById('send-commit-button');
const isNewFileCheckbox = document.getElementById('isNewFileCheck');
const newFileNumber = document.getElementById('newFileNumber');
const fileExtension = document.getElementById('file-extension');
const sendFileForm = document.getElementById('sendFileForm');

const fileInputModal = document.getElementById('fileInputModal');
const userInfoButton = document.getElementById('userInfoButton');

const adminRepoActions = document.getElementById('adminRepoActions');

const createNewRepoButton = document.getElementById('create-new-repo-button');
const repoFilenameInput = document.getElementById('repoFilename-input');
const foldernameInput = document.getElementById('foldername-input');
const submitNewRepo = document.getElementById('create-new-repo-submit');

const createNewFolderButton = document.getElementById('create-new-folder-button');
const folderCreateRepoID_Input = document.getElementById('create-folder-repo_id-input');
const folderCreatePath_Input = document.getElementById('create-folder-path-input');
const submitNewFolder = document.getElementById('create-new-folder-submit');

async function getRepositoriesList(url) {
    let request = await axios.get(url, 
        {
            headers: {'X-Session-Id': `${params.session_id}`,}
        })
    let response = request.data;
    return response
}

function createRepositoryTree(repository) {
    let tree = fillFolders(new TreeNode(repository.id, repository.name, 'folder', null, null), repository);
    return tree
}

function createTreeNode(file, parent){
    let treeNode = new TreeNode(file.id, file.name, file.type, file.lock, parent);
    return treeNode;
}

function fillFolders(node, repo) {
    for (let index in repo.files) {
        let file = repo.files[index];
        file.id = parseInt(index);

        if (file.type === 'folder') {
            node.children.push(fillFolders(new TreeNode(file.id, file.name, file.type, file.lock, node), file));
        } else {
            node.children.push(new TreeNode(file.id, file.name, file.type, file.lock, node, file.last_commit));
        }
    }
    return node;
}

function fillFoldersRecursively(folder, parentFolder = null) {
    for (let file of folder.files) {
        parentFolder.children.push(createTreeNode(file, parentFolder));
        if (file.type === 'folder') {
            fillFoldersRecursively(file, folder);
        }
    }
}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// Стартовая функция
async function createPage() {
    //axios.defaults.withCredentials = true;
    repoList = await getRepositoriesList(`http://${ip}/api/repositories/list`);
    console.log(repoList);
    activeRepo = createRepositoryTree(repoList.repositories[currentRepoID]);
    currentNode = activeRepo;
    currentRepoID = activeRepo.key;
    DOM_CreateHierarchy(currentNode);
    DOM_UpdateButtonsState(activeFile);
    DOM_CreateRepoList(repoList);
    DOM_AddAdminActions();
    dropdownRepoButton.textContent = activeRepo.value;

    quitButton.addEventListener('click', () => quitPage());
    captureButton.addEventListener('click', () => captureFile());
    uncaptureButton.addEventListener('click', () => uncaptureFile());
    pushButton.addEventListener('click', () => pushFile());
    pullButton.addEventListener('click', () => pullFile());

    sendCommitButton.addEventListener('click', () => {
        filenameInput.value = filenameInput.value + fileExtension.textContent;
    });
    //sendFileForm.action = `http://${ip}/api/repositories/pushFile`;

    $("#sendFileForm").ajaxForm({url: `http://${ip}/api/repositories/pushFile`, type: 'post'})

    searchField.addEventListener('input', () => {
        //setTimeout(() => DOM_CreateHierarchy(currentNode, searchField.value), 750);
        DOM_CreateHierarchy(currentNode, searchField.value);
    });

    descriptionSectionButton.addEventListener('click', () => {
        DOM_CreateDescriptionSection(activeFile);
    })

    codeSectionButton.addEventListener('click', () => {
        DOM_CreateCodeSection(activeFile);
    });

    commitSectionButton.addEventListener('click', () => {
        DOM_CreateCommitSection(activeFile);
    });

    createNewRepoButton.addEventListener('click', () => {
        DOM_FillNewRepoModal();
    });

    createNewFolderButton.addEventListener('click', () => {
        DOM_FillNewFolderModal();
    });

    submitNewRepo.addEventListener('click', (event) => {
        event.preventDefault();
        createNewRepo();
    });

    submitNewFolder.addEventListener('click', (event) => {
        event.preventDefault();
        createNewFolder();
    });

    fileInput.addEventListener('change', () => {
        console.log('0');
        let str = fileInput.value;
        if (str.indexOf("\\") >= 0) {
            let label = str.split("\\").pop();
            fileInputLabel.textContent = label;
            if (label.indexOf(".") >= 0 && isNewFileCheckbox.checked) {
                fileExtension.textContent = "." + label.split(".").pop();
                filenameInput.value = label.substring(0, label.lastIndexOf("."));
            }
        }
        else 
            fileInputLabel.textContent = str.value;
        
    });

    isNewFileCheckbox.addEventListener('change', () => {
        if (isNewFileCheckbox.checked) {
            filenameInput.readOnly = false;
            newFileNumber.value = 1;
        } else {
            filenameInput.readOnly = true;
            newFileNumber.value = 0;
        }
    });

    // function handleForm(event) { 
    //     console.log('123123');
    //     event.preventDefault();
    //     alert(); 
    // } 
    // sendFileForm.addEventListener('submit', handleForm);
    
}

// Обновление страницы
async function updatePage() {
    repoList = await getRepositoriesList(`http://${ip}/api/repositories/list`);
    activeRepo = createRepositoryTree(repoList.repositories.find(element => element.id === currentRepoID));
    currentNode = activeRepo;
    currentRepoID = activeRepo.key;
    DOM_CreateHierarchy(currentNode);
    DOM_UpdateButtonsState(activeFile);
    dropdownRepoButton.textContent = activeRepo.value;
}

// Глобальные переменные
let repoList;
let activeRepo;
let activeFile = null;
let currentNode = null;
let currentRepoID = 0;
let activeFileCommits = []; 

let userID = getCookie('id');
let userRoleID = getCookie('role_id');
let userUsername = getCookie('username');
let userRealName = getCookie('real_name');

createPage();


// +-------------------------------+
// | Работа с файлами репозиториев |
// +-------------------------------+

// Захват файла
async function captureFile() {
    console.log(`Capturing: ${activeFile.value}`);
    let url = `http://${ip}/api/repositories/lock`;

    let data = {
        'repo_id': activeRepo.key,
        'filename': activeFile.value,
    }

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((message) => {
        updatePage();
    }).catch((error) => {
        if (error === "Файл не найден") {
            alert("Файл не найден или захвачен другим пользователем!");
        }
        console.log(error);
    });
}

// Снятие захвата
async function uncaptureFile() {
    console.log(`Uncapturing: ${activeFile.value}`);
    let url = `http://${ip}/api/repositories/unlock`;

    let data = {
        'repo_id': activeRepo.key,
        'filename': activeFile.value,
    }

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((message) => {
        updatePage();
    }).catch((message) => {
        console.log(message);
    });
}

// Положить новую версию в хранилище
async function pushFile() {
    console.log(`Pushing`);

    fileInputLabel.value = 'Файл для загрузки...';
    filenameInput.value = '';
    filenameInput.readOnly = false;
    commitTextInput.value = '';
    fileInput.value = '';

    if (activeFile === null) {
        filenameInput.value = '';
        filenameInput.readOnly = false;
        isNewFileCheckbox.checked = true;
        newFileNumber.value = 1;
        fileExtension.textContent = "...";
    } else {
        let str = activeFile.value;
        if (str.indexOf(".") >= 0) {
            fileExtension.textContent = "." + str.split(".").pop();
            filenameInput.value = str.substring(0, str.lastIndexOf("."));
        } else {
            fileExtension.textContent = "...";
            filenameInput.value = str;
        }
        filenameInput.readOnly = true;
        isNewFileCheckbox.checked = false;
        newFileNumber.value = 0;
    }

    repoIdInput.value = activeRepo.key;
    document.cookie = `X-Session-Id=${params.session_id}`;
}

// Взять версию из хранилища
async function pullFile() {
    console.log(`Pulling: ${activeFile.value}`);
    let url = `http://${ip}/api/repositories/downloadFile?`;

    let response = await fetch(url + new URLSearchParams({
        'repo_id': activeRepo.key,
        'filename': activeFile.value, 
    }), {
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        }
    })
    .then((res) => { return blobToFile(res.blob(), activeFile.value)})
    .then((data) => {
        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = `${activeFile.value}`;
        window.URL.revokeObjectURL(url);
        a.click();
    });
}

async function createNewRepo() {
    let url = `http://${ip}/api/repositories/createRepository?name=${repoFilenameInput.value}&folder_name=${foldernameInput.value}`;
    console.log('Creating new repo');
    let response = await fetch(url, {
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        }
    }).then((message) => {
        console.log(message);
        updatePage();
    }).catch((message) => {
        console.log(message);
    });
}

async function createNewFolder() {
    let url = `http://${ip}/api/repositories/createFolder?repo_id=${folderCreateRepoID_Input.value}&path=${folderCreatePath_Input.value}`;
    console.log('Creating new file');
    let response = await fetch(url, {
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        }
    }).then((message) => {
        console.log(message);
        updatePage();
    }).catch((message) => {
        console.log(message);
    });
}

async function getFileInfo() {
    let url = `http://${ip}/api/repositories/commitHistory?repo_id=${currentRepoID}&filename=${activeFile.value}`;

    let response = await fetch(url, {
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        }
    }).then((res) => {
        return res.json();
    }).then((data) => {
        activeFileCommits = data;
    }).catch((error) => {
        console.log(error);
        activeFileCommits = null;
    });
}

// Выйти со страницы
function quitPage() {
    if (confirm('Вы действительно хотите выйти?')) window.location.replace("./login.html");
}

// +-------------------------------+
// | Работа с DOM-деревом страницы |
// +-------------------------------+

// Создание DOM-элементов списка репозиториев
function DOM_CreateRepoList(repoList) { 
    repoList.repositories.forEach(repo => {
        const repoDOM = repoTemplate.content.cloneNode(true);
        repoDOM.querySelector('div').addEventListener('click', event => {
            currentRepoID = repo.id;
            updatePage();
            DOM_CreateHierarchy(activeRepo);
            //DOM_CreateDescription();
            DOM_UpdateInfoPanelHeader();
            descriptionWrapper.innerHTML = '';

            dropdownRepoButton.textContent = activeRepo.value;
        });
        let repoNameDOM = repoDOM.querySelector('p');
        repoNameDOM.textContent = repo.name;
        repoMenu.prepend(repoDOM);
    });
}

// Создание DOM-элементов списка файлов
function DOM_CreateHierarchy(treeNode, searchedValue = '') {
    filesList.innerHTML = ''; // Очищаем DOM-дерево
    currentNode = treeNode;
    activeFile = null;
    let counter = 0;
    console.log(treeNode);
    if (treeNode.parent !== null) {
        const parentDOM = parentTemplate.content.cloneNode(true);
        parentDOM.querySelector('div').addEventListener('click', event => {
            DOM_UpdateButtonsState(null);
        });
        parentDOM.querySelector('div').addEventListener('dblclick', event => {
            DOM_CreateHierarchy(treeNode.parent, searchedValue);
        });
        filesList.append(parentDOM);
    }
    treeNode.children.forEach(child => {
        if (searchedValue === '' || child.value.includes(searchedValue)) {
            let newDOMItem;
            //console.log(child);
            counter++;
            if (child.type === "folder") {
                newDOMItem = folderTemplate.content.cloneNode(true);
                newDOMItem.querySelector('div').addEventListener('click', event => {
                    activeFile = null;
                    DOM_UpdateInfoPanelHeader();
                    descriptionWrapper.innerHTML = '';
                    DOM_UpdateButtonsState(null);
                });
                newDOMItem.querySelector('div').addEventListener('dblclick', event => DOM_CreateHierarchy(child, searchedValue));
            } else if (child.type === "file" && child.lock !== null) {
                newDOMItem = capturedFileTemplate.content.cloneNode(true);
                newDOMItem.querySelector('.additional-info').textContent = child.lock.user;
                let boxRow = newDOMItem.querySelector('.box-row');
                boxRow.addEventListener('click', event => {
                    activeFile = child;
                    //event.target.classList.toggle('active-file', true);
                    DOM_UpdateInfoPanelHeader();
                    DOM_CreateDescriptionSection(activeFile);
                    DOM_UpdateButtonsState(child);
                })
            } else if (child.type === "file" && child.lock === null) {
                newDOMItem = uncapturedFileTemplate.content.cloneNode(true);
                newDOMItem.querySelector('.additional-info').textContent = new Date(child.last_commit.timestamp * 1000).toLocaleString('en-GB');
                let boxRow = newDOMItem.querySelector('.box-row');
                boxRow.addEventListener('click', event => {
                    activeFile = child;
                    //boxRow.classList.toggle('active-file', true);
                    DOM_UpdateInfoPanelHeader();
                    DOM_CreateDescriptionSection(activeFile);
                    DOM_UpdateButtonsState(child);
                })
            }
        let fileNameDOM = newDOMItem.querySelector('p');
        fileNameDOM.textContent = child.value;
        filesList.append(newDOMItem);
        }
    });
    if (counter === 0 && searchedValue !== '') {
        console.log(searchedValue);
        let emptyDOM = emptyTemplate.content.cloneNode(true);
        filesList.innerHTML = '';
        filesList.append(emptyDOM);
    }

    let childCount = treeNode.children.length;
    numberOfFilesElement.textContent = `${counter} ${numeralFormatter(counter, 'файл', 'файла', 'файлов')}`;
}

function DOM_UpdateInfoPanelHeader() {
    if (activeFile === null) descriptionFileName.textContent = 'Выберите файл для просмотра информации';
    else descriptionFileName.textContent = activeFile.value;
}

// Создание DOM-элементов описания выбранного файла
async function DOM_CreateDescriptionSection(activeFile = null) {
    descriptionWrapper.textContent = '';
    if (activeFile == null) return;
    await getFileInfo();

    if (activeFileCommits === undefined) {
        alert('Список коммитов пуст');
        return;
    }

    //let descriptionDOM;
    if (activeFile.lock === null) {
        let descriptionDOM = unlockedFileDescription.content.cloneNode(true);
        let descriptionTable = descriptionDOM.querySelector('table');

        descriptionTable.querySelector('.last-commit-timestamp').textContent = new Date(activeFileCommits.commits[0].timestamp * 1000).toLocaleString('en-GB');
        descriptionTable.querySelector('.last-commit-creator').textContent = activeFileCommits.commits[0].user;
        descriptionTable.querySelector('.first-commit-timestamp').textContent = new Date(activeFileCommits.commits[activeFileCommits.commits.length - 1].timestamp * 1000).toLocaleString('en-GB');
        descriptionTable.querySelector('.first-commit-creator').textContent = activeFileCommits.commits[activeFileCommits.commits.length - 1].user;

        descriptionWrapper.append(descriptionTable);
    } else if (activeFile.lock !== null) {
        let descriptionDOM = lockedFileDescription.content.cloneNode(true);

        let descriptionTable = descriptionDOM.querySelector('table');

        descriptionTable.querySelector('.locked-by').textContent = activeFile.lock.user;
        descriptionTable.querySelector('.last-commit-timestamp').textContent = new Date(activeFileCommits.commits[0].timestamp * 1000).toLocaleString('en-GB');
        descriptionTable.querySelector('.last-commit-creator').textContent = activeFileCommits.commits[0].user;
        descriptionTable.querySelector('.first-commit-timestamp').textContent = new Date(activeFileCommits.commits[activeFileCommits.commits.length - 1].timestamp * 1000).toLocaleString('en-GB');
        descriptionTable.querySelector('.first-commit-creator').textContent = activeFileCommits.commits[activeFileCommits.commits.length - 1].user;

        descriptionWrapper.append(descriptionDOM);
    }   
}

// Создание DOM-элементов кода выбранного файла
function DOM_CreateCodeSection(activeFile = null) {
    descriptionWrapper.textContent = '';

}

// Создание DOm-элементов коммитов выбранного файла
async function DOM_CreateCommitSection(activeFile = null) {
    descriptionWrapper.textContent = '';
    if (activeFile == null) return;
    await getFileInfo();

    if (activeFileCommits === undefined) {
        alert('Список коммитов пуст');
        return;
    }

    let commitsTable = fileCommitsTableTemplate.content.cloneNode(true);

    let tablePart = commitsTable.querySelector('.table-part');

    activeFileCommits.commits.forEach(commit => {
        let commitTableRow = fileCommitTemplate.content.cloneNode(true);

        commitTableRow.querySelector('.commit-timestamp').textContent = new Date(commit.timestamp * 1000).toLocaleString('en-GB');
        commitTableRow.querySelector('.commit-message').textContent = commit.message;
        commitTableRow.querySelector('.commit-user').textContent = commit.user;

        tablePart.append(commitTableRow);
    });

    descriptionWrapper.append(commitsTable);
}

// Обновление состояний функциональных кнопок
function DOM_UpdateButtonsState(treeNode = null) {
    uncaptureButton.classList.toggle('btn-light', true);
    uncaptureButton.classList.toggle('btn-warning', false);
    pullButton.classList.toggle('btn-light', true);
    pullButton.classList.toggle('btn-warning', false);
    pullButton.title = "";

    // Capture/Uncapture
    if (treeNode === null) {
        captureButton.disabled = true;
        uncaptureButton.disabled = true;
        pushButton.disabled = false;
    } else if (treeNode.lock === null) {
        captureButton.disabled = false;
        uncaptureButton.disabled = true;
    } else if (treeNode.lock !== null) {
        captureButton.disabled = true;
        if (userUsername === treeNode.lock.user) {
            uncaptureButton.disabled = false;
            pushButton.disabled = false;
        } else {
            pushButton.disabled = true;
            pullButton.classList.toggle('btn-light', false);
            pullButton.classList.toggle('btn-warning', true);
            pullButton.dataset.target = "tooltip";
            pullButton.title = "Файл захвачен другим пользователем, его версия скоро может измениться!";
            if (userRoleID == 1) {
                uncaptureButton.disabled = false;
                uncaptureButton.classList.toggle('btn-light', false);
                uncaptureButton.classList.toggle('btn-warning', true);
                uncaptureButton.dataset.target = "tooltip";
                uncaptureButton.title = "Файл захвачен другим пользователем, снятие может быть проведено только принудительно!";             
            } else {
                uncaptureButton.disabled = true;
            }
        }
        
    }

    // Push/Pull
    if (treeNode === null) {
        //pushButton.disabled = true;
        pullButton.disabled = true; 
    } else if (treeNode.lock === null) {
        //pushButton.disabled = true;
        pullButton.disabled = false;     
    } else if (treeNode.lock !== null) {
        //pushButton.disabled = false;
        pullButton.disabled = false;   
    }
}

function DOM_AddAdminActions() {
    if (parseInt(userRoleID) === 1) {
        userInfoButton.textContent = "Администратор";
        adminRepoActions.hidden = false;
    } else {
        userInfoButton.textContent = "Пользователь";
        adminRepoActions.hidden = true;
    }
}

function DOM_FillNewRepoModal() {

}

function DOM_FillNewFolderModal() {
    folderCreateRepoID_Input.value = activeRepo.key;
}