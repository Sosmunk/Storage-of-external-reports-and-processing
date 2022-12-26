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
  
// class Tree {
//     constructor(key, value = key, type = 'folder') {
//         this.root = new TreeNode(key, value, type, false);
//     }

//     *preOrderTraversal(node = this.root) {
//         yield node;
//         if (node.children.length) {
//             for (let child of node.children) {
//                 yield* this.preOrderTraversal(child);
//             }
//         }
//     }

//     *postOrderTraversal(node = this.root) {
//         if (node.children.length) {
//             for (let child of node.children) {
//                 yield* this.postOrderTraversal(child);
//             }
//         }
//         yield node;
//     }

//     insert(parentNodeKey, key, value = key, type, lock = false) {
//         for (let node of this.preOrderTraversal()) {
//             if (node.key === parentNodeKey) {
//                 node.children.push(new TreeNode(key, value, type, lock, node));
//                 return true;
//             }
//         }
//         return false;
//     }

    // remove(key) {
    //     for (let node of this.preOrderTraversal()) {
    //     const filtered = node.children.filter(c => c.key !== key);
    //         if (filtered.length !== node.children.length) {
    //             node.children = filtered;
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // find(key) {
    //     for (let node of this.preOrderTraversal()) {
    //         if (node.key === key) return node;
    //     }
    //     return undefined;
    // }
//}

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

const repoMenu = document.getElementById('repo-menu');
const dropdownRepoButton = document.getElementById('dropdown-repo-button');
const filesList = document.getElementById('files-list');

const emptyTemplate = document.getElementById('empty-template');
const repoTemplate = document.getElementById('repo-template');
const parentTemplate = document.getElementById('parent-template');
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

const descriptionFileName = document.getElementById('description-file-name');
const descriptionWrapper = document.getElementById('description-wrapper');

const descriptionSectionButton =  document.getElementById('description-section-button');
const codeSectionButton = document.getElementById('code-section-button');
const commitSectionButton = document.getElementById('commit-section-button');

const fileInput = document.getElementById('file-input');
const repoIdInput = document.getElementById('repo_id-input');
const filenameInput = document.getElementById('filename-input');
const commitTextInput = document.getElementById('commit-text-input');
const sendCommitButton = document.getElementById('send-commit-button');

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
    repoList = await getRepositoriesList("http://5.165.236.244:9999/api/repositories/list");
    console.log(repoList);
    activeRepo = createRepositoryTree(repoList.repositories[currentRepoID]);
    currentNode = activeRepo;
    currentRepoID = activeRepo.key;
    DOM_CreateHierarchy(currentNode);
    DOM_UpdateButtonsState(activeFile);
    DOM_CreateRepoList(repoList);
    dropdownRepoButton.textContent = activeRepo.value;

    quitButton.addEventListener('click', () => quitPage());
    captureButton.addEventListener('click', () => captureFile());
    uncaptureButton.addEventListener('click', () => uncaptureFile());
    pushButton.addEventListener('click', () => pushFile());
    pullButton.addEventListener('click', () => pullFile());

    //sendCommitButton.addEventListener('click', () => pushFile());

    searchField.addEventListener('input', () => {
        //setTimeout(() => DOM_CreateHierarchy(currentNode, searchField.value), 750);
        DOM_CreateHierarchy(currentNode, searchField.value);
    });


}

// Обновление страницы
async function updatePage() {
    repoList = await getRepositoriesList("http://5.165.236.244:9999/api/repositories/list");
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

createPage();


// +-------------------------------+
// | Работа с файлами репозиториев |
// +-------------------------------+

// Захват файла
async function captureFile() {
    console.log(`Capturing: ${activeFile.value}`);
    let url = "http://5.165.236.244:9999/api/repositories/lock";

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

// Снятие захвата
async function uncaptureFile() {
    console.log(`Uncapturing: ${activeFile.value}`);
    let url = "http://5.165.236.244:9999/api/repositories/unlock";

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
    console.log(`Pushing: ${activeFile.value}`);
    let url = "http://5.165.236.244:9999/api/repositories/pushFile";
    filenameInput.value = activeFile.value;
    repoIdInput.value = activeRepo.key;
    document.cookie = `X-Session-Id=${params.session_id}`;
    //let reader = new FileReader();
    // reader.onload = function(e) {
    //     console.log(reader.readAs(fileInput.files[0]));
	// };
    // reader.onerror = function(e) {
	// 	console.log('Error : ' + e.type);
	// };
    // let data = {
    //     'repo_id': activeRepo.key,
    //     'filename': activeFile.value,
    //     'commit_message': commitTextInput.value,
    //     'file': reader.readAsText(fileInput.files[0]),
    // }

    // let response = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //         'X-Session-Id': params.session_id,
    //         'Content-Type': 'multipart/form-data',
    //     },
    //     body: JSON.stringify(data),
    // })
    // .then((res) => { console.log(res); })
    // .catch((message) => {
    //     console.log(message);
    // });
}

// Взять версию из хранилища
async function pullFile() {
    console.log(`Pulling: ${activeFile.value}`);
    let url = "http://5.165.236.244:9999/api/repositories/downloadFile?";

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
            dropdownRepoButton.textContent = activeRepo.value;
        });
        let repoNameDOM = repoDOM.querySelector('p');
        repoNameDOM.textContent = repo.name;
        repoMenu.prepend(repoDOM);
    });
}

// Создание DOM-элементов списка файлов
function DOM_CreateHierarchy(treeNode, searchedValue = null) {
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
        if (searchedValue === null || child.value.includes(searchedValue)) {
            let newDOMItem;
            //console.log(child);
            counter++;
            if (child.type === "folder") {
                newDOMItem = folderTemplate.content.cloneNode(true);
                newDOMItem.querySelector('div').addEventListener('click', event => {
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
                    DOM_CreateDescriptionSection(child);
                    DOM_UpdateButtonsState(child);
                })
            } else if (child.type === "file" && child.lock === null) {
                newDOMItem = uncapturedFileTemplate.content.cloneNode(true);
                newDOMItem.querySelector('.additional-info').textContent = new Date(child.last_commit.timestamp * 1000).toLocaleString('en-GB');
                let boxRow = newDOMItem.querySelector('.box-row');
                boxRow.addEventListener('click', event => {
                    activeFile = child;
                    //boxRow.classList.toggle('active-file', true);
                    DOM_CreateDescriptionSection(child);
                    DOM_UpdateButtonsState(child);
                })
            }
        let fileNameDOM = newDOMItem.querySelector('p');
        fileNameDOM.textContent = child.value;
        filesList.append(newDOMItem);
        }
    });
    if (counter === 0 && searchedValue !== '') {
        let emptyDOM = emptyTemplate.content.cloneNode(true);
        filesList.innerHTML = '';
        filesList.append(emptyDOM);
    }
    let childCount = treeNode.children.length;
    numberOfFilesElement.textContent = `${counter} ${numeralFormatter(counter, 'файл', 'файла', 'файлов')}`;
}

// Создание DOM-элементов описания выбранного файла
function DOM_CreateDescriptionSection(activeFile = null) {
    descriptionWrapper.innerHTML = '';
    if (activeFile === null) {
        descriptionFileName.textContent = 'Выберите файл для просмотра информации';
    } else {
        descriptionFileName.textContent = activeFile.value;
    }
}

// Создание DOM-элементов кода выбранного файла
function DOM_CreateCodeSection(activeFile = null) {

}

// Создание DOm-элементов коммитов выбранного файла
function DOM_CreateCommitSection(activeFile = null) {

}

// Обновление состояний функциональных кнопок
function DOM_UpdateButtonsState(treeNode = null) {
    console.log(treeNode);

    // Capture/Uncapture
    if (treeNode === null) {
        captureButton.disabled = true;
        uncaptureButton.disabled = true;
    } else if (treeNode.lock === null) {
        captureButton.disabled = false;
        uncaptureButton.disabled = true;
    } else if (treeNode.lock !== null) {
        captureButton.disabled = true;
        uncaptureButton.disabled = false;
    }

    // Push/Pull
    if (treeNode === null) {
        pushButton.disabled = true;
        pullButton.disabled = true; 
    } else if (treeNode.lock === null) {
        pushButton.disabled = true;
        pullButton.disabled = false;     
    } else if (treeNode.lock !== null) {
        pushButton.disabled = false;
        pullButton.disabled = true;   
    }
}

// 
// currentFolder - текущая папка (TreeNode)
// Даблклик по папке -> currentfolder
// Отображать в начале отрендеренного списка файлов и папок родительскую;
// При нажатии на папку родителя или кнопку назад -> currentfolder = currentfolder.parent