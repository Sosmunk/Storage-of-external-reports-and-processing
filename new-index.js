class TreeNode {
    constructor(key, value = key, type = type, parent = null) {
        this.key = key;
        this.type = type;
        this.value = value;
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
        this.root = new TreeNode(key, value, type);
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

    insert(parentNodeKey, key, value = key, type) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === parentNodeKey) {
                node.children.push(new TreeNode(key, value, type, node));
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

// class File {
//     constructor(name, path, isCaptured = false) {
//         this.name = name;
//         this.path = path;
//         this.isCaptured = isCaptured;
//     }
// }
// class Folder {
//     constructor(name, path, isCaptured = false) {
//         this.name = name;
//         this.path = path;
//         this.isCaptured = isCaptured;
//         this.files = [];
//         this.folders = [];
//     }
// }
// class Repository {
//     constructor(name, path) {
//         this.name = name;
//         this.path = path;
//         this.files = [];
//         this.folders = [];
//     }

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

document.addEventListener('DOMContentLoaded', function() {
    getRepositoriesList('http://5.165.236.244:9999/api/repositories/list').then(res => console.log(res))
});

async function getRepositoriesList(url) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
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
    let treeNode = new TreeNode(file.id, file.name, file.type, parent);
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
async function init(){
    let a = await getRepositoriesList("http://5.165.236.244:9999/api/repositories/list")
    console.log(a.repositories)
    let b = await createRepositoryTree(a.repositories[0])
    console.log(b)
}
init()

// 
// currentFolder - текущая папка (TreeNode)
// Даблклик по папке -> currentfolder
// Отображать в начале отрендеренного списка файлов и папок родительскую;
// При нажатии на папку родителя или кнопку назад -> currentfolder = currentfolder.parent