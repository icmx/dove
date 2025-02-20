(() => {
  'use strict';

  /** Script to automatically adjust textareas heights while typing */
  const initAutosizes = () => {
    const controls = document.querySelectorAll('[data-autosize]');

    controls.forEach((control) => {
      control.addEventListener('input', () => {
        control.style.height = 'inherit';
        control.style.height = control.scrollHeight.toString() + 'px';
      });

      control.dispatchEvent(new InputEvent('input'));
    });
  };

  /**
   * Script to automatically save and load user forms.
   * Depends on backend (reads cookie when request was successful)
   */
  const initAutosaves = () => {
    const pattern = /dove-autosave=(?<key>\S+)/;
    const match = document.cookie.match(pattern);
    const key = match?.groups?.key;

    if (key) {
      document.cookie = `dove-autosave=${key}; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;

      localStorage.removeItem(`dove:autosave:${key}`);
    }

    const debounce = (action, delay) => {
      let timer;

      return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
          action(...args);
        }, delay);
      };
    };

    const forms = document.querySelectorAll('[data-autosave]');

    forms.forEach((form) => {
      const key = form.dataset.autosave;

      const setItem = debounce(
        (value) => localStorage.setItem(`dove:autosave:${key}`, value),
        300
      );

      const getItem = () =>
        localStorage.getItem(`dove:autosave:${key}`);

      const input = document.createElement('input');

      input.setAttribute('type', 'hidden');
      input.setAttribute('name', '_autosave');
      input.setAttribute('value', key);

      form.appendChild(input);

      form.addEventListener('input', () => {
        const data = new FormData(form);

        data.delete('secret');
        data.delete('_autosave');

        const params = new URLSearchParams(data);

        const value = params.toString();

        setItem(value);
      });

      const stored = getItem();

      if (!stored) {
        return;
      }

      const entries = new URLSearchParams(stored).entries();

      for (const [k, v] of entries) {
        const control = form.elements[k];

        control.value = v;
        control.dispatchEvent(new InputEvent('input'));
      }
    });
  };

  /** Script to automatically append reply number to user reply text */
  const initAutoids = () => {
    const replyForm = document.querySelector('[data-autoid-form]');
    const contentControl = replyForm?.elements?.content;

    const replyAnchors = document.querySelectorAll(
      '[data-autoid-reply]'
    );

    if (!contentControl || replyAnchors.length === 0) {
      return;
    }

    replyAnchors.forEach((replyAnchor) => {
      const id = `#${replyAnchor.dataset.autoidReply}`;

      const prevValue = contentControl.value;
      const nextValue = [prevValue, id]
        .filter((text) => !!text)
        .join('\n\n')
        .concat('\n');

      replyAnchor.addEventListener('click', (event) => {
        event.preventDefault();

        contentControl.value = nextValue;

        contentControl.focus();
        contentControl.dispatchEvent(new InputEvent('input'));
        replyForm.dispatchEvent(new InputEvent('input'));
      });
    });
  };

  initAutosizes();
  initAutosaves();
  initAutoids();
})();
