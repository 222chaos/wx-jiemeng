Page({
  data: {
    expression: '',
    result: '0',
    buttons: [
      ['C', '(', ')', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '⌫', '=']
    ]
  },

  onButtonTap(e) {
    const value = e.currentTarget.dataset.value;
    let { expression } = this.data;

    if (value === 'C') {
      this.setData({ expression: '', result: '0' });
      return;
    }

    if (value === '⌫') {
      expression = expression.slice(0, -1);
      this.setData({ expression, result: '0' });
      return;
    }

    if (value === '=') {
      try {
        const result = this.evaluateExpression(expression);
        this.setData({ result: result.toString(), expression: result.toString() });
      } catch (e) {
        this.setData({ result: 'Error' });
      }
      return;
    }

    // Append character
    expression += value;
    this.setData({ expression });
  },

  evaluateExpression(exp) {
    const sanitized = exp
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Tokenize: 3+5*(2-4.5)
    const tokens = sanitized.match(/(\d+(\.\d+)?|[+\-*/()])/g);
    if (!tokens) throw new Error('Invalid');

    const output = [];
    const ops = [];

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (const token of tokens) {
      if (!isNaN(token)) {
        output.push(parseFloat(token));
      } else if (token in precedence) {
        while (
          ops.length &&
          precedence[ops[ops.length - 1]] >= precedence[token]
        ) {
          const op = ops.pop();
          const b = output.pop();
          const a = output.pop();
          output.push(this.compute(a, b, op));
        }
        ops.push(token);
      } else if (token === '(') {
        ops.push(token);
      } else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          const op = ops.pop();
          const b = output.pop();
          const a = output.pop();
          output.push(this.compute(a, b, op));
        }
        if (ops.length === 0) throw new Error('Unmatched parenthesis');
        ops.pop(); // remove (
      }
    }

    while (ops.length) {
      const op = ops.pop();
      const b = output.pop();
      const a = output.pop();
      output.push(this.compute(a, b, op));
    }

    if (output.length !== 1) throw new Error('Invalid expression');

    return +output[0].toFixed(8);
  },

  compute(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: throw new Error('Unknown operator');
    }
  }
});
