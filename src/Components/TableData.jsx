import React, { useState } from 'react';

// Utility function to calculate variance percentage
const calculateVariance = (original, updated) => {
  if (original === 0) return 0;
  return ((updated - original) / original) * 100;
};

// Recursive component to render rows
const Row = ({ row, updateRowValue, updateParentValue, isParent, parentValue, updateChildVariance }) => {
  const [inputValue, setInputValue] = useState('');
  const [variance, setVariance] = useState(null);

  const handleAllocationPercentage = () => {
    const percentage = parseFloat(inputValue);
    if (!isNaN(percentage)) {
      const newValue = row.value + (row.value * percentage) / 100;
      setVariance(calculateVariance(row.value, newValue));
      updateRowValue(row.id, newValue);
      if (isParent) {
        // Update children proportionally and adjust their variance
        updateParentValue(row.id, newValue);
      }
    }
  };

  const handleAllocationValue = () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      setVariance(calculateVariance(row.value, newValue));
      updateRowValue(row.id, newValue);
      if (isParent) {
        // Update children proportionally and adjust their variance
        updateParentValue(row.id, newValue);
      }
    }
  };

  return (
    <tr>
      <td>
        {row.label}
        {row.children && (
          <ul>
            {row.children.map((child) => (
              <li key={child.id}>
                <Row
                  row={child}
                  updateRowValue={updateRowValue}
                  updateParentValue={updateParentValue}
                  isParent={false}
                  parentValue={row.value}
                  updateChildVariance={updateChildVariance} // Pass updateChildVariance to child rows
                />
                {child.variance !== null && <p>Child Variance: {child.variance.toFixed(2)}%</p>}
              </li>
            ))}
          </ul>
        )}
      </td>
      <td>
        {row.value}
        <div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
          />
          <button onClick={handleAllocationPercentage}>Allocation %</button>
          <button onClick={handleAllocationValue}>Allocation Val</button>
        </div>
        {variance !== null && <p>Variance: {variance.toFixed(2)}%</p>}
      </td>
    </tr>
  );
};

const Table = () => {
  const initialData = [
    {
      id: 'electronics',
      label: 'Electronics',
      value: 1500,
      children: [
        { id: 'phones', label: 'Phones', value: 800, originalValue: 800, variance: null },
        { id: 'laptops', label: 'Laptops', value: 700, originalValue: 700, variance: null },
      ],
    },
    {
      id: 'furniture',
      label: 'Furniture',
      value: 1000,
      children: [
        { id: 'tables', label: 'Tables', value: 300, originalValue: 300, variance: null },
        { id: 'chairs', label: 'Chairs', value: 700, originalValue: 700, variance: null },
      ],
    },
  ];

  const [data, setData] = useState(initialData);

  // Function to update child variance considering the parent's variance
  const updateChildVariance = (child, parentVariance) => {
    // Ensure child's value is updated before calculating variance
    const childVariance = calculateVariance(child.originalValue, child.value);
    const adjustedVariance = childVariance * (1 + parentVariance / 100); // Adjust based on parent's variance
    child.variance = adjustedVariance;
  };

  // Helper function to update a child's value
  const updateRowValue = (id, newValue) => {
    const updatedData = data.map((row) => {
      if (row.id === id) {
        return { ...row, value: newValue };
      }

      if (row.children) {
        row.children = row.children.map((child) => {
          if (child.id === id) {
            return { ...child, value: newValue };
          }
          return child;
        });
      }

      return row;
    });

    setData(updatedData);

    // After updating a child, update the parent value as well
    // Check if the updated row is a child, and update the parent if necessary
    data.forEach((row) => {
      if (row.children) {
        row.children.forEach((child) => {
          if (child.id === id) {
            // Parent's value needs to be recalculated
            updateParentValue(row.id);
          }
        });
      }
    });
  };

  // Function to update parent value (distribute value to children proportionally)
  const updateParentValue = (id, newParentValue) => {
    const updatedData = data.map((row) => {
      if (row.id === id) {
        // If a new parent value is passed, use it, otherwise calculate from the children
        const totalChildrenValue = row.children.reduce((sum, child) => sum + child.value, 0);

        // If parent value is being set, we set it
        if (newParentValue !== undefined) {
          row.value = newParentValue;
        } else {
          // If newParentValue isn't passed, calculate the parent's total based on its children
          row.value = totalChildrenValue;
        }

        // Adjust children values proportionally based on their contribution to the parent's total
        row.children = row.children.map((child) => {
          const childProportion = child.value / totalChildrenValue;
          const newChildValue = row.value * childProportion;
          child.value = newChildValue;

          // Update the child's variance based on the parent variance
          const parentVariance = calculateVariance(row.originalValue, row.value); // Calculate parent's variance
          child.variance = calculateVariance(child.originalValue, child.value); // Recalculate the child's variance

          // Adjust the child's variance based on parent's variance proportionally
          const adjustedVariance = child.variance * (1 + parentVariance / 100);
          child.variance = adjustedVariance;

          return child;
        });
      }

      return row;
    });

    setData(updatedData);
  };

  // Function to calculate Grand Total
  const calculateGrandTotal = () => {
    return data.reduce((total, row) => {
      return total + row.value;
    }, 0);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <Row
              key={row.id}
              row={row}
              updateRowValue={updateRowValue}
              updateParentValue={updateParentValue} // Pass the updateParentValue function
              isParent={true}
              updateChildVariance={updateChildVariance} // Pass updateChildVariance to Row component
            />
          ))}
          <tr>
            <td>Grand Total</td>
            <td>{calculateGrandTotal()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
