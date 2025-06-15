const Switch = ({ value, children }) => {
  // Trova il Case che corrisponde al valore
  const matchingCase = children.find((child) => child.props.value === value);

  // Se trova un Case corrispondente, renderizza il suo contenuto
  if (matchingCase) {
    return matchingCase.props.children;
  }

  // Cerca il Case di default (quello senza valore)
  const defaultCase = children.find((child) => child.props.value === undefined);

  // Se c'è un Case di default lo renderizza, altrimenti null
  return defaultCase ? defaultCase.props.children : null;
};

// Componente Case da usare come figlio di Switch
// eslint-disable-next-line no-unused-vars
Switch.Case = ({ value, children }) => {
  return children;
};

export default Switch;
