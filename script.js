document.addEventListener('DOMContentLoaded', function () {
  feather.replace(); // Transformar os ícones

  // Variáveis iniciais
  let tasks = [];
  const tasksElem = document.querySelector('ul.tasks');
  const addTaskInputElem = document.querySelector('#add-task input');
  const addTaskButtonElem = document.querySelector('#add-task button');

  // Verificar se o content da tarefa é maior que 4 ou menor que 101 caracteres
  function verifyTask(content = '') {
    if (content.length < 5 || content.length > 100) return false;
    else return true;
  }

  // Gerar a string do elemento
  function genTaskItemElem(task) {
    return `
      <li id="${task.id}" class="task-item${task.isCompleted ? ' completed' : ''}">
        <input id="${task.id}" class="make-completed" type="checkbox" ${task.isCompleted ? 'checked' : ''}>
        <span>${task.content}</span>
        <i id="${task.id}" class="delete-task" data-feather="trash"></i>
      </li>
    `;
  }

  // Renderizar toda a lista e tarefas
  function render() {
    tasksElem.innerHTML = '';

    tasks = tasks.sort((a, b) => a.isCompleted - b.isCompleted);

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

  // Chamada quando o usuário clica em adicionar tarefa
  function handleAddTask() {
    const task = {
      id: String(Date.now()),
      content: addTaskInputElem.value,
      isCompleted: false,
    };

    // Cancelar caso o content não seja válido
    if (!verifyTask(task.content)) return;

    tasks.push(task);
    addTaskInputElem.value = '';

    const taskElem = genTaskItemElem(task);
    tasksElem.innerHTML = taskElem + tasksElem.innerHTML;

    feather.replace();
    registerDeleteAction();
    registerCompleteAction();
    saveData();
  }

  // Chamada quando o usuário deleta uma tarefa
  function handleDeleteTask(event) {
    const taskId = event.path.filter(item => item.tagName === 'svg')[0].id;

    tasks = tasks.filter(task => task.id !== taskId);
    render();
    saveData();
  }

  // Chamado quando o usuário marca/desmarca uma tarefa como completa
  function handleComplete(event) {
    const taskId = event.target.id;
    const status = event.target.checked;

    tasks = tasks.map(task => ({
      ...task,
      isCompleted: task.id === taskId ? status : task.isCompleted,
    }));

    render();
    saveData();
  }

  // Carregar dados do localStorage
  function loadData() {
    if (localStorage.getItem('daily-tasks/data')) {
      tasks = JSON.parse(localStorage.getItem('daily-tasks/data'));
      render();
    }
  }

  // Salvar dados no localStorage
  function saveData() {
    localStorage.setItem('daily-tasks/data', JSON.stringify(tasks));
  }

  // Adicionar função que vai ser chamada para adicionar uma nova tarefa
  addTaskButtonElem.onclick = handleAddTask;
  addTaskInputElem.onkeydown = ({ key }) => { if (key === 'Enter') handleAddTask() };

  // Tentar carregar dados do localStorage
  loadData();
});