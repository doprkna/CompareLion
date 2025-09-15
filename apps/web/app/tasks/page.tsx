import React from 'react';

const TasksPage = () => {
  // Mock data for tasks
  const tasks = [
    { id: 1, title: 'Task 1', description: 'Description for task 1' },
    { id: 2, title: 'Task 2', description: 'Description for task 2' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add New Task</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
              <p className="text-gray-600">{task.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
