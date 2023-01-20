"use strict";

/**
 * Общий фронтенд-сервис КБ для старого и нового кода
 *
 */
window.CB = (function(){

    /**********************************************************************************************************
     *  Работа со стилями компонентов
     *********************************************************************************************************/
    const styles = (()=>{
        /** аккумулятор глобальных стилей компонентов */
        let glob = [];

        /**
         * Добавить глобальные стили (в общий style в head)
         *
         * @param string value строка css-спецификаций
         * @returns void
         */
        function globed(value) {
            glob.push(value);
        }

        /**
         * Добавить локальные стили данного компонента (в vue-стиле)
         *
         * TODO: не реализовано, пока повторяет логику globed()
         *
         * @param string value строка css-спецификаций
         * @returns string атрибут локализации данного компонента (x-v-data-SWB34UHS16)
         */
        function scoped(value) {
            globed(value);
        }

        /**
         * Добавить глобальные стили на страницу
         */
        function inject() {
            const style = Object.assign(document.createElement('style'), { textContent: glob.join('') } );
            const ref = document.head.getElementsByTagName('style')[0] || null;
            document.head.insertBefore(style, ref);
        }

        return {
            globed,
            scoped,
            inject,
        }
    })();

    /**********************************************************************************************************
     *  Глобальное хранилище КБ
     *********************************************************************************************************/
    const store = (()=>{
        /** глобальный vuex-store */
        let store = Vuex.createStore({
            state: () => ({
                hello: 'hello from CB.store!',
            }),
        });

        /** Получить хранилище */
        function useStore() {
            return store;
        }

        /** Подключить модуль хранилища */
        function register(path, module) {
            store.registerModule(path, module);
        }

        /** Отключить модуль хранилища */
        function unregister(path, module) {
            store.unregisterModule(path, module);
        }

        /** Применить мутацию */
        function commit(type, payload) {
            store.commit(type, payload)
        }

        /** Вызвать действие */
        function dispatch(type, payload) {
            store.dispatch(type, payload)
        }

        return {
            useStore,
            register,
            unregister,
            dispatch,
        }
    })();

    /**********************************************************************************************************
     *  Publisher/Subscriber
     *********************************************************************************************************/
    const pubsub = (() => {
      let subscribers = {};

      return {
        /**
         * Подписаться на событие.
         * @param {string} event идентификатор события
         * @param {function} callback
         */
        async subscribe(event, callback) {
          if (!subscribers[event]) {
            subscribers[event] = [];
          }
          subscribers[event].push(callback);
        },

        /**
         * Отписаться от события.
         * @param {string} event идентификатор события
         * @returns
         */
        async unsubscribe(event) {
          if (!subscribers[event]) {
            return;
          }
          // delete(subscribers[event][INDEX]);
        },

        /**
         * Запустить событие.
         * @param {string} event идентификатор события
         * @param {any} data
         * @returns
         */
        async publish(event, data) {
          if (!subscribers[event]) {
            return;
          }
          subscribers[event].forEach(subscriberCallback => subscriberCallback(data));
        },
      }
    })();

    /**********************************************************************************************************
     *  Реализация DataRepositoryInterface для фронта
     *********************************************************************************************************/
     const repository = ( () => {

      function getRecord(table, id) {
        throw 'getRecord  is not implemented'
      }

      function query(table, options) {
        // использовать библиотеку https://github.com/crcn/sift.js для формирования запросов,
        // обеспечив совместимость с форматом описания запросов на беке (src/CBEXT/query_language)
        throw 'query  is not implemented'
      }

      function createRecord(table, data) {
        throw 'createRecord  is not implemented'
      }

      function updateRecord(table, id, data) {
        throw 'updateRecord  is not implemented'
      }

      function deleteRecord(table, id) {
        throw 'deleteRecord  is not implemented'
      }

      return {
          getRecord,
          query,
          createRecord,
          updateRecord,
          deleteRecord,
      }
  })();

  /**********************************************************************************************************
     *  CB - глобальный сервис КБ
     *********************************************************************************************************/
    return {
        /** Работа со стилями компонентов */
        styles,
        /** DEPRECATED, Общее хранилище данных */
        store,
        /** Отображение чатов в трее */
        display_chats_in_tray: {},
        /** DEPRECATED ? прогрузка глобальных переменных с бека */
        globals: {
            user: {},
            config: {},
        },
        /** Подписка, публикация событий */
        pubsub,
        /** Доступ к записям пользовательских таблиц для старого кода */
        repository,
    }
})();
