class TreeNode {
    constructor(key, value = key, type = type, lock = false, parent = null) {
        this.key = key;
        this.value = value;
        this.type = type;
        this.lock = lock;
        this.parent = parent;
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
  
class Tree {
    constructor(key, value = key, type = 'folder') {
        this.root = new TreeNode(key, value, type, false);
    }

    *preOrderTraversal(node = this.root) {
        yield node;
        if (node.children.length) {
            for (let child of node.children) {
                yield* this.preOrderTraversal(child);
            }
        }
    }

    *postOrderTraversal(node = this.root) {
        if (node.children.length) {
            for (let child of node.children) {
                yield* this.postOrderTraversal(child);
            }
        }
        yield node;
    }

    insert(parentNodeKey, key, value = key, type, lock = false) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === parentNodeKey) {
                node.children.push(new TreeNode(key, value, type, lock, node));
                return true;
            }
        }
        return false;
    }

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
}

function numeralFormatter(number, oneCase, twoFourCase, fiveNineCase) {
    if (10 <= number % 100 && number % 100 <= 20) return fiveNineCase;
    else if (number % 10 === 1) return oneCase;
    else if (2 <= number % 10 && number % 10 <= 4) return twoFourCase;
    else return fiveNineCase;
}

const repoMenu = document.getElementById('repo-menu');
const dropdownRepoButton = document.getElementById('dropdown-repo-button');
const filesList = document.getElementById('files-list');

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


async function getRepositoriesList(url) {
    let request = await axios.get(url, 
        {
            headers: {'X-Session-Id': `${params.session_id}`}
        })
    let response = request.data;
    return response
}

function createRepositoryTree(repository) {
    const tree = new Tree(repository.id, repository.name);
    for (file of repository.files){
        tree.root.children.push(createTreeNode(file, tree.root))
    }
    return tree
}

function createTreeNode(file, parent){
    let treeNode = new TreeNode(file.id, file.name, file.type, file.lock, parent);
    return treeNode;
}

function fillFoldersRecursively(folder, parentFolder) {
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
    repoList = await getRepositoriesList("http://5.165.236.244:9999/api/repositories/list");
    activeRepo = createRepositoryTree(repoList.repositories[currentRepoID]);
    currentNode = activeRepo.root;

    DOM_CreateHierarchy(currentNode);
    DOM_UpdateButtonsState(activeFile);
    DOM_CreateRepoList(repoList);
    dropdownRepoButton.textContent = activeRepo.root.value;

    quitButton.addEventListener('click', () => quitPage());
    captureButton.addEventListener('click', () => captureFile());
    uncaptureButton.addEventListener('click', () => uncaptureFile());
    pushButton.addEventListener('click', () => pushFile());
    pullButton.addEventListener('click', () => pullFile());
}

// Обновление страницы
async function updatePage() {
    repoList = await getRepositoriesList("http://5.165.236.244:9999/api/repositories/list");
    let newVar = repoList.repositories.find(element => element.id === currentRepoID);
    activeRepo = createRepositoryTree(newVar);
    currentNode = activeRepo.root;
    DOM_CreateHierarchy(currentNode);
    DOM_UpdateButtonsState(activeFile);
    dropdownRepoButton.textContent = activeRepo.root.value;
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
        'repo_id': activeRepo.root.key,
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
        'repo_id': activeRepo.root.key,
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
function pushFile() {
    console.log(`Pushing: ${activeFile.value}`);
}

// Взять версию из хранилища
function pullFile() {
    console.log(`Pulling: ${activeFile.value}`);
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
            DOM_CreateHierarchy(activeRepo.root);
            dropdownRepoButton.textContent = activeRepo.root.value;
        });
        let repoNameDOM = repoDOM.querySelector('p');
        repoNameDOM.textContent = repo.name;
        repoMenu.prepend(repoDOM);
    });
}

// Создание DOM-элементов списка файлов
function DOM_CreateHierarchy(treeNode) {
    filesList.innerHTML = ''; // Очищаем DOM-дерево
    currentNode = treeNode;
    activeFile = null;

    if (treeNode.parent !== null) {
        const parentDOM = parentTemplate.content.cloneNode(true);
        parentDOM.querySelector('div').addEventListener('click', event => {
            DOM_UpdateButtonsState(null);
        });
        parentDOM.querySelector('div').addEventListener('dblclick', event => {
            DOM_CreateHierarchy(treeNode.parent);
        });
        filesList.append(parentDOM);
    }
    treeNode.children.forEach(child => {
        let newDOMItem;
        if (child.type === "folder") {
            newDOMItem = folderTemplate.content.cloneNode(true);
            newDOMItem.querySelector('div').addEventListener('click', event => {
                DOM_UpdateButtonsState(null);
            });
            newDOMItem.querySelector('div').addEventListener('dblclick', event => DOM_CreateHierarchy(child));
        } else if (child.type === "file" && child.lock === true) {
            newDOMItem = capturedFileTemplate.content.cloneNode(true);
            newDOMItem.querySelector('div').addEventListener('click', event => {
                activeFile = child;
                DOM_CreateDescription(child);
                DOM_UpdateButtonsState(child);
            })
        } else if (child.type === "file" && child.lock === false) {
            newDOMItem = uncapturedFileTemplate.content.cloneNode(true);
            newDOMItem.querySelector('div').addEventListener('click', event => {
                activeFile = child;
                DOM_CreateDescription(child);
                DOM_UpdateButtonsState(child);
            })
        }
        let fileNameDOM = newDOMItem.querySelector('p');
        fileNameDOM.textContent = child.value;
        filesList.append(newDOMItem);
    });
    let childCount = treeNode.children.length;
    numberOfFilesElement.textContent = `${childCount} ${numeralFormatter(childCount, 'файл', 'файла', 'файлов')}`;
}

// Создание DOM-элементов описания файла
function DOM_CreateDescription(treeNode) {

}

// Обновление состояний функциональных кнопок
function DOM_UpdateButtonsState(treeNode) {
    //console.log(treeNode);

    // Capture/Uncapture
    if (treeNode === null) {
        captureButton.disabled = true;
        uncaptureButton.disabled = true;
    } else if (treeNode.lock === false) {
        captureButton.disabled = false;
        uncaptureButton.disabled = true;
    } else if (treeNode.lock === true) {
        captureButton.disabled = true;
        uncaptureButton.disabled = false;
    }

    // Push/Pull
    if (treeNode === null) {
        pushButton.disabled = true;
        pullButton.disabled = true; 
    } else if (treeNode.lock === false) {
        pushButton.disabled = true;
        pullButton.disabled = false;     
    } else if (treeNode.lock === true) {
        pushButton.disabled = false;
        pullButton.disabled = true;   
    }
}




// 
// currentFolder - текущая папка (TreeNode)
// Даблклик по папке -> currentfolder
// Отображать в начале отрендеренного списка файлов и папок родительскую;
// При нажатии на папку родителя или кнопку назад -> currentfolder = currentfolder.parent