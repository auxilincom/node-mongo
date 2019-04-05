const databases = require('./reducers/databases');

const createStore = (reducers) => {
  const state = {};
  const handlers = [];

  Object.keys(reducers).forEach((key) => {
    state[key] = {};
  });

  const dispatch = (action) => {
    const oldState = {
      ...state,
    };

    Object.keys(reducers).forEach((key) => {
      state[key] = reducers[key](state[key], action);
    });

    const unchangedHandlersList = [...handlers];
    for (let i = 0; i < unchangedHandlersList.length; i += 1) {
      unchangedHandlersList[i](state, oldState);
    }
  };

  const getState = () => {
    return state;
  };

  const subscribe = (handler) => {
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  };

  const unsubscribe = (handler) => {
    const pos = handlers.indexOf(handler);
    if (pos !== -1) {
      handlers.splice(pos, 1);
    }
  };

  return {
    dispatch,
    getState,
    subscribe,
    unsubscribe,
  };
};

const store = createStore({
  databases,
});

module.exports = store;
