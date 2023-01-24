// +-------------------+
// | Работа с классами |
// +-------------------+

// Класс файлового узла
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


// +-------------------------+
// | Вспомогательные функции |
// +-------------------------+

function numeralFormatter(number, oneCase, twoFourCase, fiveNineCase) {
    // Изменение окончаний числительных в зависимости от значения
    if (10 <= number % 100 && number % 100 <= 20) return fiveNineCase;
    else if (number % 10 === 1) return oneCase;
    else if (2 <= number % 10 && number % 10 <= 4) return twoFourCase;
    else return fiveNineCase;
}

function blobToFile(theBlob, fileName) {
    // Превращение файлоподобного объекта в файл
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

function getCookie(c_name) {
    // Получение значения указанной cookie-переменной
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

function readTextFile(file) {
    // Чтение текстового содержимого указанного файла
    let rawFile = new XMLHttpRequest();
    let allText = '';
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}

// sendData is our main function
function sendData() {
    // If there is a selected file, wait until it is read
    // If there is not, delay the execution of the function
    if (!fileContent.binary && fileContent.dom.files.length > 0) {
    setTimeout(sendData, 10);
    return;
    }

    // To construct our multipart form data request,
    // We need an XMLHttpRequest instance
    const XHR = new XMLHttpRequest();

    // We need a separator to define each part of the request
    const boundary = "blob";

    // Store our body request in a string.
    let data = "";

    data += `--${boundary}\r\n`;

    data += `content-disposition: form-data; name="repo_id"\r\n`;
    // There's a blank line between the metadata and the data
    data += '\r\n';

    // Append the text data to our body's request
    data += activeRepo.key + "\r\n";


    // So, if the user has selected a file
    if (fileContent.dom.files[0]) {
    // Start a new part in our body's request
        data += `--${boundary}\r\n`;

        // Describe it as form data
        data += `content-disposition: form-data; name="file"; filename="${fileContent.dom.files[0].name}"\r\n`;
        // And the MIME type of the file
        data += `Content-Type: ${fileContent.dom.files[0].type}\r\n`;

        // There's a blank line between the metadata and the data
        data += '\r\n';

        // Append the binary data to our body's request
        data += fileContent.binary + '\r\n';
    }

    data += `--${boundary}\r\n`;

    // Say it's form data, and name it
    data += `content-disposition: form-data; name="new"\r\n`;
    // There's a blank line between the metadata and the data
    data += '\r\n';

    // Append the text data to our body's request
    data += newFileNumber.value + "\r\n";

    // Text data is simpler
    // Start a new part in our body's request
    data += `--${boundary}\r\n`;

    // Say it's form data, and name it
    data += `content-disposition: form-data; name="filename"\r\n`;
    // There's a blank line between the metadata and the data
    data += '\r\n';

    // Append the text data to our body's request
    if (currentPath === '')
        data += `${currentPath}` + filenameInput.value + "\r\n";
    else
        data += `${currentPath}/` + filenameInput.value + "\r\n";

    data += `--${boundary}\r\n`;

    // Say it's form data, and name it
    data += `content-disposition: form-data; name="commit_message"\r\n`;
    // There's a blank line between the metadata and the data
    data += '\r\n';

    data += commitTextInput.value + "\r\n";

    // Once we are done, "close" the body's request

    data += `--${boundary}--`;

    // Define what happens on successful data submission
    XHR.addEventListener('load', (event) => {
        updatePage();
    });

    // Define what happens in case of an error
    XHR.addEventListener('error', (event) => {
        alert('Что-то пошло не так!');
    });

    // Set up our request
    XHR.open('POST', `http://${ip}/api/repositories/pushFile`);

    // Add the required HTTP header to handle a multipart form data POST request
    XHR.setRequestHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);

    // Send the data
    XHR.send(data);
}


// +-----------------------+
// | Объявление переменных |
// +-----------------------+

// Глобальные переменные
let repoList;
let activeRepo;
let activeFile = null;
let currentNode = null;
let currentRepoID = 0;
let activeFileCommits = []; 
let currentPath = '';

let userID = getCookie('id');
let userRoleID = getCookie('role_id');
let userUsername = getCookie('username');
let userRealName = getCookie('real_name');

const ip = readTextFile("ip.cfg");

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});


// Переменные DOM-элементов страницы
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
const removeRepoButton = document.getElementById('remove-repo-button');
const repoFilenameInput = document.getElementById('repoFilename-input');
const foldernameInput = document.getElementById('foldername-input');
const submitNewRepo = document.getElementById('create-new-repo-submit');

const createNewFolderButton = document.getElementById('create-new-folder-button');
const removeFolderButton = document.getElementById('remove-folder-button');
const folderCreateRepoID_Input = document.getElementById('create-folder-repo_id-input');
const folderCreatePath_Input = document.getElementById('create-folder-path-input');
const submitNewFolder = document.getElementById('create-new-folder-submit');

const fileContent = {
    dom: fileInput,
    binary: null,
};

const reader = new FileReader();
reader.addEventListener("load", () => {
    fileContent.binary = reader.result;
});

// At page load, if a file is already selected, read it.
if (fileContent.dom.files[0]) {
    reader.readAsBinaryString(fileContent.dom.files[0]);
}

// If not, read the file once the user selects it.
fileContent.dom.addEventListener("change", () => {
    if (reader.readyState === FileReader.LOADING) {
        reader.abort();
    }

    reader.readAsBinaryString(fileContent.dom.files[0]);
});


// +-----------------------------+
// | Объявление основных функций |
// +-----------------------------+

// Стартовая функция 
async function createPage() {
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

    searchField.addEventListener('input', () => {
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

    removeRepoButton.addEventListener('click', () => {
        if (confirm('Вы действительно хотите удалить текущий репозиторий? Действие невозможно отменить!')) {
            removeRepo();
        }
    });

    createNewFolderButton.addEventListener('click', () => {
        DOM_FillNewFolderModal();
    });

    removeFolderButton.addEventListener('click', () => {
        if (confirm('Вы действительно хотите удалить выбранный файл/папку? Действие невозможно отменить!')) {
            removeFolder();
        }
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
        console.log('Значение нового файла: ' + newFileNumber.value);
    });
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

// Получение списка репозиториев от сервера
async function getRepositoriesList(url) {
    let request = await axios.get(url, 
        {
            headers: {'X-Session-Id': `${params.session_id}`,}
        })
    let response = request.data;
    return response
}

// Создание файлового дерева
function createRepositoryTree(repository) {
    let tree = fillFolders(new TreeNode(repository.id, repository.name, 'folder', null, null), repository);
    return tree
}

// // Создание узла файлового дерева
// function createTreeNode(file, parent){
//     let treeNode = new TreeNode(file.id, file.name, file.type, file.lock, parent);
//     return treeNode;
// }

// Рекурсивное создание узлов дерева
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

// Положить новую версию или новый файл в хранилище
async function pushFile() {
    console.log(`Pushing`);

    // fileInputLabel.value = 'Файл для загрузки...';
    // filenameInput.readOnly = false;
    // commitTextInput.value = '';
    // fileInput.value = '';

    if (activeFile === null) {
        //filenameInput.value = currentPath;
        filenameInput.readOnly = false;
        isNewFileCheckbox.checked = true;
        newFileNumber.value = 1;
        fileExtension.textContent = "...";
    } else {
        let str = activeFile.value;
        if (str.indexOf(".") >= 0) {
            fileExtension.textContent = "." + str.split(".").pop();
            //filenameInput.value = `${currentPath}/${str.substring(0, str.lastIndexOf("."))}`;
            filenameInput.value = `${str.substring(0, str.lastIndexOf("."))}`;
        } else {
            fileExtension.textContent = "...";
            //filenameInput.value = `${currentPath}/${str}`;
            filenameInput.value = `${str}`;
        }
        filenameInput.readOnly = true;
        isNewFileCheckbox.checked = false;
        newFileNumber.value = 0;
    }

    // These variables are used to store the form data

    // Add 'submit' event handler
    sendFileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        sendData();
    });

    repoIdInput.value = activeRepo.key;

    document.cookie = `X-Session-Id=${params.session_id}`;
}

// Взять версию из хранилища
async function pullFile() {
    console.log(`Pulling: ${activeFile.value}`);
    let url = `http://${ip}/api/repositories/downloadFile?`;
    let pullPath;

    if (currentPath === '')
        pullPath = `${activeFile.value}`;
    else
        pullPath = `${currentPath}/${activeFile.value}`;


    let response = await fetch(url + new URLSearchParams({
        'repo_id': activeRepo.key,
        'filename': pullPath, 
        'version': document.querySelector('input[name="commits-list"]:checked').value,
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

// Создание нового репозитория (Только для администратора!)
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

// Создание новой папки (Только для администратора!)
async function createNewFolder() {
    let url;
    if (currentPath === '')
        url = `http://${ip}/api/repositories/createFolder?repo_id=${folderCreateRepoID_Input.value}&path=${folderCreatePath_Input.value}`;
    else
        url = `http://${ip}/api/repositories/createFolder?repo_id=${folderCreateRepoID_Input.value}&path=${currentPath + '/' + folderCreatePath_Input.value}`;

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

// Поулчение списка коммитов для выбранного файла
async function getFileInfo() {
    let url;
    if (currentPath === '')
        url = `http://${ip}/api/repositories/commitHistory?repo_id=${currentRepoID}&filename=${activeFile.value}`;
    else
        url = `http://${ip}/api/repositories/commitHistory?repo_id=${currentRepoID}&filename=${currentPath}/${activeFile.value}`;

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

// Удаление текущего репозитория (Только для администратора!)
async function removeRepo() {
    let url = `http://${ip}/api/repositories/removeRepository?repo_id=${currentRepoID}`;

    let response = await fetch(url, {
        headers: {
            'X-Session-Id': params.session_id,
            'Content-Type': 'application/json',
        }
    }).then((message) => {
        console.log(message);
        location.reload();
    }).catch((message) => {
        console.log(message);
    });
}

// Удаление выбранного файла (Только для администратора!)
async function removeFolder() {
    let url;
    if (activeFile === null) {
        if (currentPath === '') {
            alert('Невозможно удалить корневую папку репозитория!');
            return;
        }
        url = `http://${ip}/api/repositories/removeFile?repo_id=${currentRepoID}&path=${currentPath}`;
    } else {
        if (currentPath === '') {
            url = `http://${ip}/api/repositories/removeFile?repo_id=${currentRepoID}&path=${activeFile.value}`;
        } else {
            url = `http://${ip}/api/repositories/removeFile?repo_id=${currentRepoID}&path=${currentPath}/${activeFile.value}`;
        }
    }

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

// Выход со страницы
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
            currentPath = '';
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
    if (treeNode.parent !== null) {
        const parentDOM = parentTemplate.content.cloneNode(true);
        parentDOM.querySelector('div').addEventListener('click', event => {
            DOM_UpdateButtonsState(null);
        });
        parentDOM.querySelector('div').addEventListener('dblclick', event => {
            DOM_CreateHierarchy(treeNode.parent, searchedValue);
            if((currentPath.match(new RegExp('/', 'g')) || []).length === 0)
                currentPath = '';
            else  
                currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                //currentPath += '/';
            console.log(currentPath);
        });
        filesList.append(parentDOM);
    }
    treeNode.children.forEach(child => {
        if (searchedValue === '' || child.value.includes(searchedValue)) {
            let newDOMItem;
            counter++;
            if (child.type === "folder") {
                newDOMItem = folderTemplate.content.cloneNode(true);
                newDOMItem.querySelector('div').addEventListener('click', event => {
                    activeFile = null;
                    DOM_UpdateInfoPanelHeader();
                    descriptionWrapper.innerHTML = '';
                    DOM_UpdateButtonsState(null);
                });
                newDOMItem.querySelector('div').addEventListener('dblclick', event => {
                    DOM_CreateHierarchy(child, searchedValue);
                    if (currentPath == '') {
                        currentPath += `${child.value}`;
                    } else {
                        currentPath += `/${child.value}`
                    }
                    
                    console.log(currentPath);
                });
            } else if (child.type === "file" && child.lock !== null) {
                newDOMItem = capturedFileTemplate.content.cloneNode(true);
                newDOMItem.querySelector('.additional-info').textContent = child.lock.user;
                let boxRow = newDOMItem.querySelector('.box-row');
                boxRow.addEventListener('click', event => {
                    activeFile = child;
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

// Изменение заголовка панели информации
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
    let commitCounter = 0;

    activeFileCommits.commits.forEach(commit => {
        let commitTableRow = fileCommitTemplate.content.cloneNode(true);
        commitCounter += 1;
        let commitRadio = commitTableRow.querySelector('.commit-radio');

        commitRadio.value = commit.id;
        if (commitCounter === 1)
            commitRadio.checked = true;  


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

// Изменение визуального представления страницы в зависимости от роли пользователя 
function DOM_AddAdminActions() {
    if (parseInt(userRoleID) === 1) {
        userInfoButton.textContent = "Администратор";
        adminRepoActions.hidden = false;
    } else {
        userInfoButton.textContent = "Пользователь";
        adminRepoActions.hidden = true;
    }
}

// Заполнение полей формы "Создание новой папки" при открытии 
function DOM_FillNewFolderModal() {
    folderCreateRepoID_Input.value = activeRepo.key;
}


// +------------------------------------------+
// | Запуск выполнения скрипта после загрузки |
// +------------------------------------------+

createPage();