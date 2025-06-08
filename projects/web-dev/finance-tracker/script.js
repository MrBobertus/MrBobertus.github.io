const bankTransferButton = document.querySelector(".bank-transfer");
const closeActionInterfaceButton = document.querySelector(".close-action-interface");
const sectionTransferButton = document.querySelector(".section-transfer");
const newProjectButton = document.querySelector(".newProjectButton");
const actionBackgroundFade = document.querySelector(".action-background-fade");

const actionInterfaceTitle = actionBackgroundFade.querySelector("p.action-interface");
const actionInterfaceSelect = actionBackgroundFade.querySelector("select.action-interface");
const actionInterfaceInput = actionBackgroundFade.querySelector("input.action-interface");
const actionButton = actionBackgroundFade.querySelector(".action-button");

const bankBalanceDisplay = document.querySelector(".bank-balance");
const sectionBalanceDisplay = document.querySelector(".section-balance");
const projectGrid = document.querySelector(".project-grid");

let bankBalance = 0;
let projects = [];
let nextProjectId = 1;
let currentAction = null;

const STORAGE_KEY = 'financeManagerData';

function formatCurrency(amount) {
    return amount.toFixed(2);
}

function getSectionTotalBalance() {
    return projects.reduce((total, project) => total + project.balance, 0);
}

function updateBalancesDisplay() {
    bankBalanceDisplay.textContent = formatCurrency(bankBalance);
    sectionBalanceDisplay.textContent = formatCurrency(getSectionTotalBalance());
}

function renderProjects() {
    projectGrid.innerHTML = "";
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.classList.add('project');
        projectElement.dataset.projectId = project.id;

        projectElement.innerHTML = `
            <div class="block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet h-8 w-8"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
                <div class="projects-block">
                    <p class="project-name">${project.name}</p>
                    <p class="project-balance">€<span class="project-item-balance">${formatCurrency(project.balance)}</span></p>
                </div>
            </div>
            <button class="delete-project"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button>
        `;
        projectGrid.appendChild(projectElement);

        const deleteButton = projectElement.querySelector('.delete-project');
        deleteButton.addEventListener('click', () => handleDeleteProject(project.id));
    });
    updateBalancesDisplay();
}

function handleDeleteProject(projectId) {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex > -1) {
        const projectBalanceToReturn = projects[projectIndex].balance;
        bankBalance += projectBalanceToReturn;
        projects.splice(projectIndex, 1);
        renderProjects();
        saveData();
    }
}

function showActionInterfaceModal() {
    actionInterfaceInput.value = "";
    actionBackgroundFade.style.visibility = "visible";
}

function hideActionInterfaceModal() {
    actionBackgroundFade.style.visibility = "hidden";
    currentAction = null;
    actionInterfaceInput.type = 'text';
    actionInterfaceInput.placeholder = '0.00';
    actionInterfaceSelect.style.display = 'block';

    const dynamicProjectSelect = actionBackgroundFade.querySelector('.action-interface-project-select');
    if (dynamicProjectSelect) {
        dynamicProjectSelect.remove();
    }
}

function saveData() {
    const dataToSave = {
        bankBalance: bankBalance,
        projects: projects,
        nextProjectId: nextProjectId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        bankBalance = parsedData.bankBalance || 0;
        projects = parsedData.projects || [];
        nextProjectId = parsedData.nextProjectId || 1;
    }
    renderProjects();
}

bankTransferButton.addEventListener("click", () => {
    currentAction = 'bank';
    actionInterfaceTitle.textContent = "Bank Transaction";
    actionInterfaceSelect.innerHTML = `
        <option value="deposit">Deposit</option>
        <option value="withdraw">Withdraw</option>
    `;
    actionInterfaceSelect.style.display = 'block';
    actionInterfaceInput.type = 'number';
    actionInterfaceInput.placeholder = "0.00";
    showActionInterfaceModal();
});

closeActionInterfaceButton.addEventListener("click", () => {
    hideActionInterfaceModal();
});

actionBackgroundFade.addEventListener("click", (event) => {
    if (event.target === actionBackgroundFade) {
        hideActionInterfaceModal();
    }
});

sectionTransferButton.addEventListener("click", () => {
    currentAction = 'sectionTransfer';
    actionInterfaceTitle.textContent = "Transfer Funds";

    actionInterfaceSelect.innerHTML = `
        <option value="depositToProject">Deposit to Project</option>
        <option value="withdrawFromProject">Withdraw from Project</option>
    `;
    actionInterfaceSelect.style.display = 'block';

    const existingProjectSelect = actionBackgroundFade.querySelector('.action-interface-project-select');
    if (existingProjectSelect) {
        existingProjectSelect.remove();
    }

    const projectSelectElement = document.createElement('select');
    projectSelectElement.classList.add('action-interface', 'action-interface-project-select');

    if (projects.length === 0) {
        projectSelectElement.innerHTML = '<option value="" disabled selected>No projects available</option>';
        projectSelectElement.disabled = true;
    } else {
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            projectSelectElement.appendChild(option);
        });
        projectSelectElement.disabled = false;
    }

    actionInterfaceSelect.after(projectSelectElement);

    actionInterfaceInput.type = 'number';
    actionInterfaceInput.placeholder = "0.00";
    showActionInterfaceModal();
});

newProjectButton.addEventListener("click", () => {
    currentAction = 'newProject';
    actionInterfaceTitle.textContent = "Create New Project";
    actionInterfaceSelect.style.display = 'none';
    const existingProjectSelect = actionBackgroundFade.querySelector('.action-interface-project-select');
    if (existingProjectSelect) {
        existingProjectSelect.remove();
    }
    actionInterfaceInput.type = 'text';
    actionInterfaceInput.placeholder = "Project Name";
    showActionInterfaceModal();
});

actionButton.addEventListener('click', () => {
    const rawAmount = actionInterfaceInput.value;
    const amount = parseFloat(rawAmount);

    if (currentAction === 'bank') {
        const selectedOperation = actionInterfaceSelect.value;
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }
        if (selectedOperation === 'deposit') {
            bankBalance += amount;
        } else if (selectedOperation === 'withdraw') {
            if (amount > bankBalance) {
                alert("Insufficient bank balance.");
                return;
            }
            bankBalance -= amount;
        }
    } else if (currentAction === 'newProject') {
        const projectName = actionInterfaceInput.value.trim();
        if (!projectName) {
            alert("Please enter a project name.");
            return;
        }
        projects.push({ id: nextProjectId++, name: projectName, balance: 0.00 });
        renderProjects();
    } else if (currentAction === 'sectionTransfer') {
        const transferType = actionInterfaceSelect.value;
        const projectSelectElem = actionBackgroundFade.querySelector('.action-interface-project-select');

        if (!projectSelectElem || projectSelectElem.disabled) {
             alert("No project selected or available for transfer.");
             return;
        }
        const selectedProjectId = parseInt(projectSelectElem.value);

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive amount for transfer.");
            return;
        }
        if (isNaN(selectedProjectId)) {
            alert("Please select a project.");
            return;
        }

        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) {
            alert("Selected project not found.");
            return;
        }

        if (transferType === 'depositToProject') {
            if (amount > bankBalance) {
                alert("Insufficient bank balance to deposit to project.");
                return;
            }
            bankBalance -= amount;
            project.balance += amount;
        } else if (transferType === 'withdrawFromProject') {
            if (amount > project.balance) {
                alert("Insufficient project balance to withdraw.");
                return;
            }
            project.balance -= amount;
            bankBalance += amount;
        }
        renderProjects();
    }

    updateBalancesDisplay();
    saveData();
    hideActionInterfaceModal();
});

document.addEventListener('DOMContentLoaded', loadData);