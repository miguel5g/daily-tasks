class TaskDate {
  static ONE_DAY = 1000 * 60 * 60 * 24;

  /**
   * @param {number} timestamp
   */
  constructor(timestamp) {
    const date = new Date();
    if (timestamp) {
      this.date = new Date(timestamp);
    } else {
      this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  }

  previousDay() {
    return new TaskDate(this.date.getTime() - TaskDate.ONE_DAY);
  }

  nextDay() {
    return new TaskDate(this.date.getTime() + TaskDate.ONE_DAY);
  }

  toString() {
    return `${this.date.getDate().toString().padStart(2, '0')}/${(this.date.getMonth() + 1).toString().padStart(2, '0')}/${this.date.getFullYear()}`;
  }

  /**
   * @param {TaskDate} date 
   */
  toStringFrom(date) {
    try {
      if (date.getTime() === this.getTime()) {
        return 'Hoje';
      }
      else if (date.getTime() + TaskDate.ONE_DAY === this.getTime()) {
        return 'Amanhã';
      }
      else if (date.getTime() - TaskDate.ONE_DAY === this.getTime()) {
        return 'Ontem';
      } else {
        return TaskDate.toString(this.date);
      }
    } catch (err) {
      throw err;
    }
  }

  getTime() {
    return this.date.getTime();
  }

  /**
   * @param {TaskDate} date
   */
  static toString(date) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  feather.replace(); // Transformar os ícones

  // Variáveis iniciais

  /* Versões */
  const versions = ['1.0.0', '1.0.1', '1.0.2'];

  /* Elementos */
  const tasksElem = document.querySelector('ul.tasks');
  const dayElem = document.querySelector('#tasks-day strong');
  const previousDayButtonElem = document.querySelectorAll('#tasks-day button')[0];
  const nextDayButtonElem = document.querySelectorAll('#tasks-day button')[1];

  /* Lista de tarefas */
  let tasks = [];
  let allTasks = [];

  /* Dados sobre a data */
  const today = new TaskDate();
  let current = today;

  /* Configurações */
  let settings = {
    saveLocal: true,
    saveCloud: false,
    lang: 'pt-BR',
    deleteOnComplete: false,
  };

  // Verificar se o content da tarefa é maior que 4 ou menor que 101 caracteres
  function verifyTask(task) {
    if (!task) {
      return false;
    } else if (task.title.length < 5 || task.title.length > 50) {
      document.querySelector('form#add-task input#title').classList.add('invalid');
      return false;
    } else if (task.description.length > 300) {
      document.querySelector('form#add-task textarea#description').classList.add('invalid');
      return false;
    } else {
      return true;
    };
  }

  // Gerar a string do elemento
  function genTaskItemElem(task) {
    return `
      <li id="${task.id}" class="task-item${task.isCompleted ? ' completed' : ''}">
        <input id="${task.id}" class="make-completed" type="checkbox" ${task.isCompleted ? 'checked' : ''}>
        <span>${task.title}</span>
        <i id="${task.id}" class="delete-task" data-feather="trash"></i>
      </li>
    `;
  }

  // Renderizar toda a lista e tarefas
  function render() {
    tasksElem.innerHTML = '';

    tasks = tasks.sort((a, b) => a.isCompleted - b.isCompleted);

    if (tasks.length === 0) {
      tasksElem.innerHTML = `
      <li class="no-tasks">
        <img src="./assets/no-tasks.svg" alt="No tasks image">
        <strong>Nenhuma tarefa para ${current.toStringFrom(today)}!</strong>
        ${current.getTime() === today.getTime() - TaskDate.ONE_DAY ? '' : `
        <button id="no-tasks-add-button">
          <i data-feather="plus"></i>
          Adicionar tarefa
        </button>
        `}
      </li>
      `;
      if (current.getTime() !== today.getTime() - TaskDate.ONE_DAY) registerAddTaskActions();

    }

    tasks.forEach((task) => {
      const taskElem = genTaskItemElem(task);
      tasksElem.innerHTML = tasksElem.innerHTML + taskElem;
    });

    feather.replace();
    registerDeleteAction();
    registerCompleteAction();
  }

  // Adicionar função a todos os botões de deletar
  function registerDeleteAction() {
    document
      .querySelectorAll('svg.delete-task')
      .forEach(elem => elem.addEventListener('click', handleDeleteTask));
  }

  // Adicionar função a todos os Checkbox
  function registerCompleteAction() {
    document
      .querySelectorAll('input.make-completed')
      .forEach(elem => elem.addEventListener('click', handleComplete));
  }

  // Adicionar funções para todos os botões de cofigurações
  function registerSettingsActions() {
    document
      .querySelector('.floating-buttons #open-settings-modal')
      .onclick = () => openModal('settings');
    document
      .querySelector('button#save-settings')
      .onclick = handleSaveSettings;
  }

  // Adicionar funções para [add-task]
  function registerAddTaskActions() {
    document
      .querySelector('button#no-tasks-add-button')
      .onclick = () => openModal('add-task', false);
    document
      .querySelector('button#open-add-task-modal')
      .onclick = () => openModal('add-task', false);

    const titleElem = document.querySelector('form#add-task input#title');
    const descriptionElem = document.querySelector('form#add-task textarea#description');

    titleElem.onfocus = () => titleElem.classList.remove('invalid');
    descriptionElem.onfocus = () => descriptionElem.classList.remove('invalid');
  }

  // Função que vai chamar todas as funções iniciais
  function registerAll() {
    // Adicionar função que vai ser chamada para adicionar uma nova tarefa
    // addTaskButtonElem.onclick = handleAddTask;
    // addTaskInputElem.onkeydown = ({ key }) => { if (key === 'Enter') handleAddTask() };
    previousDayButtonElem.onclick = previousDay;
    nextDayButtonElem.onclick = nextDay;
    document.querySelector('form#add-task').onsubmit = handleAddTask;
    document.querySelectorAll('button.modal-close-button')
      .forEach(elem => { elem.onclick = closeModal });

    update();
    loadSettings();
    loadData();
    registerSettingsActions();
  }

  // Chamada quando o usuário clica em adicionar tarefa
  function handleAddTask(event) {
    event.preventDefault();

    const tempDate = new Date();

    const task = {
      id: String(tempDate.getTime()),
      title: document.querySelector('form#add-task input#title').value,
      description: document.querySelector('form#add-task textarea#description').value || 'Sem descrição',
      isCompleted: false,
      day: new Date(current.date.getFullYear(), current.date.getMonth(), current.date.getDate()).getTime(),
      createdAt: tempDate.getTime,
    };

    // Cancelar caso o título ou descrição não seja válido
    if (!verifyTask(task)) return;

    document.querySelector('form#add-task input#title').value = '';
    document.querySelector('form#add-task textarea#description').value = '';

    allTasks.push(task);
    closeModal('add-task', false);

    const taskElem = genTaskItemElem(task);
    if (tasks.length === 0) {
      tasksElem.innerHTML = taskElem;
    } else {
      tasksElem.innerHTML = taskElem + tasksElem.innerHTML;
    }

    feather.replace();
    updateTasks();
    registerDeleteAction();
    registerCompleteAction();
    saveData();
  }

  // Chamada quando o usuário deleta uma tarefa
  function handleDeleteTask(event) {
    const taskId = event.path.filter(item => item.tagName === 'svg')[0].id;

    allTasks = allTasks.filter(task => task.id !== taskId);
    updateTasks();
    render();
    saveData();
  }

  // Chamado quando o usuário marca/desmarca uma tarefa como completa
  function handleComplete(event) {
    const taskId = event.target.id;
    const status = event.target.checked;

    if (settings.deleteOnComplete) {
      allTasks = allTasks.filter(task => task.id !== taskId);
    } else {
      allTasks = allTasks.map(task => ({
        ...task,
        isCompleted: task.id === taskId ? status : task.isCompleted,
      }));
    }

    updateTasks();
    render();
    saveData();
  }

  // Chamado quando o usuário clica em salvar configurações
  function handleSaveSettings(event) {
    settings.saveLocal = document.querySelector('#option-save-local input').checked;
    settings.deleteOnComplete = document.querySelector('#option-delete-on-complete input').checked;

    closeModal('settings', false);
    saveSettings();
  }

  // Função chamada quando o usuário muda o dia de visualização
  function handleChangeDay() {
    dayElem.innerHTML = current.toStringFrom(today);

    updateTasks();

    if (current.previousDay().getTime() < today.previousDay().getTime()) {
      previousDayButtonElem.disabled = true;
    } else {
      previousDayButtonElem.disabled = false;
    }

    if (current.nextDay().getTime() > today.nextDay().getTime() + (TaskDate.ONE_DAY * 6)) {
      nextDayButtonElem.disabled = true;
    } else {
      nextDayButtonElem.disabled = false;
    }
  }

  // Carregar dados do localStorage
  function loadData() {
    if (localStorage.getItem('daily-tasks/data') && settings.saveLocal) {
      allTasks = JSON.parse(localStorage.getItem('daily-tasks/data'));
      updateTasks();
      render();
    }
  }

  // Salvar dados no localStorage
  function saveData() {
    if (settings.saveLocal) localStorage.setItem('daily-tasks/data', JSON.stringify(allTasks));
  }

  // Carregar configurações do localStorage
  function loadSettings() {
    if (localStorage.getItem('daily-tasks/settings')) {
      settings = JSON.parse(localStorage.getItem('daily-tasks/settings'));
      render();
    }
  }

  // Salvar configurações do localStorage
  function saveSettings() {
    localStorage.setItem('daily-tasks/settings', JSON.stringify(settings));
  }

  // Definir configurações no modal
  function populateSettings() {
    document.querySelector('#option-save-local input').checked = settings.saveLocal;
    document.querySelector('#option-delete-on-complete input').checked = settings.deleteOnComplete;
  }

  // Fechar um modal
  function closeModal(event, isEvent = true) {
    const modalName = !isEvent ? event : event
      .path.filter(item => (item.tagName || '').toLowerCase() == 'button')[0]
      .getAttribute('modal-name');

    if (!modalName || modalName === '') return;

    document.querySelector(`#${modalName}-modal`).classList.add('closed-modal');
    document.querySelector('.modal').classList.add('closed-modal');
  }

  // Abrir um modal
  function openModal(modalName) {
    if (!modalName) return;

    if (modalName === 'settings') populateSettings();

    document.querySelector(`#${modalName}-modal`).classList.remove('closed-modal');
    document.querySelector('.modal').classList.remove('closed-modal');
  }

  // Atualizar dados salvos para uma nova versão
  function update() {
    if (!localStorage.getItem('daily-tasks/version')) {
      return localStorage.setItem('daily-tasks/version', versions[versions.length - 1]);
    };
    if (localStorage.getItem('daily-tasks/version') === versions[versions.length]) return;

    const currentVersion = localStorage.getItem('daily-tasks/version');
    const updaters = {
      '1.0.0': () => { },
      '1.0.1': () => {
        console.log('[Update] 1.0.0 -> 1.0.1');
        loadData();
        tasks = tasks.map(task => ({
          id: task.id,
          title: task.content,
          description: 'Sem descrição...',
          isCompleted: task.isCompleted,
          createdAt: Date.now(),
        }));
        saveData();
        return localStorage.setItem('daily-tasks/version', '1.0.1');
      },
      '1.0.2': () => {
        console.log('[Update] 1.0.1 -> 1.0.2');
        loadData();
        allTasks = allTasks.map(task => {
          const tempDate = new Date(task.createdAt);
          const newTask = {
            ...task,
            day: new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()).getTime(),
          }
          return newTask;
        });
        saveData();
        return localStorage.setItem('daily-tasks/version', '1.0.2');
      }
    };
    const neededVersions = versions.slice(versions.indexOf(currentVersion) + 1);

    neededVersions.forEach(version => updaters[version]())
  }

  // Atualizar tasks do dia selecionado
  function updateTasks() {
    /**
     * @param {TaskDate} date 
     */
    function getTasksFrom(date) {
      return allTasks.filter(task => task.day === date.getTime());
    }

    tasks = getTasksFrom(current);
    render();
  }

  // Voltar para o dia anterior
  function previousDay() {
    if (!(current.previousDay().getTime() < today.previousDay().getTime())) {
      current = current.previousDay();
      handleChangeDay();
    }
  }

  // Ir para o próximo dia
  function nextDay() {
    current = current.nextDay();
    handleChangeDay();
  }

  // Registrar todas as funções iniciais
  registerAll();
});