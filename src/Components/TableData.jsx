import React, { useState } from 'react';

// Utility function to calculate variance percentage
const calculateVariance = (original, updated) => {
  if (original === 0) return 0;
  if (original == null || updated == null || isNaN(original) || isNaN(updated)) return 0;
  return ((updated - original) / original) * 100;
};

// Recursive component to render rows
const Row = ({ row, updateRowValue, updateParentValue, isParent, parentValue, inputValues, setInputValues }) => {
  const [variance, setVariance] = useState(row.variance || null);

  const handleAllocationPercentage = () => {
    const percentage = parseFloat(inputValues[row.id]);
    if (!isNaN(percentage)) {
      const newValue = row.value + (row.value * percentage) / 100;
      const newVariance = calculateVariance(row.value, newValue);
      setVariance(newVariance); // Set variance for this row
      updateRowValue(row.id, newValue);
      if (isParent) {
        updateParentValue(row.id, newValue); // Update parent if this is a parent row
      }
    }
  };

  const handleAllocationValue = () => {
    const newValue = parseFloat(inputValues[row.id]);
    if (!isNaN(newValue)) {
      const newVariance = calculateVariance(row.value, newValue);
      setVariance(newVariance); // Set variance for this row
      updateRowValue(row.id, newValue);
      if (isParent) {
        updateParentValue(row.id, newValue); // Update parent if this is a parent row
      }
    }
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setInputValues((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <>
      <tr>
        <td style={{ textAlign: "center" }}>{row.label}</td>
        <td style={{ fontWeight: "bold", fontSize: "3vh", textAlign: "center" }}>{row.value}</td>
        <td style={{ textAlign: "center" }}>
          <input
            type="number"
            id={row.id}  // Use row ID for unique identification
            value={inputValues[row.id] || ''} // Access value from state
            onChange={handleChange}
            placeholder="Enter value"
          />
        </td>
        <td style={{ textAlign: "center" }}>
          <button onClick={handleAllocationPercentage} style={{ width: "70%" }}>Allocation %</button>
        </td>
        <td style={{ textAlign: "center" }}>
          <button onClick={handleAllocationValue} style={{ width: "70%" }}>Allocation Val</button>
        </td>
        <td className="variance" style={{ textAlign: "center" }}>
          {variance !== null ? `${variance.toFixed(2)}%` : '-'}
        </td>
      </tr>
      {row.children && row.children.length > 0 &&
        row.children.map((child) => (
          <tr className="child-row" key={child.id}>
            <td style={{ textAlign: "center" }}>-- {child.label}</td>
            <td style={{ textAlign: "center" }}>{child.value.toFixed(2)}</td>
            <td style={{ textAlign: "center" }}>
              <input
                type="number"
                id={child.id} // Use row ID for unique identification
                value={inputValues[child.id] || ''} // Access value from state
                onChange={handleChange}
                placeholder="Enter value"
              />
            </td>
            <td style={{ textAlign: "center" }}>
              <button onClick={handleAllocationPercentage} style={{ width: "70%" }}>Allocation %</button>
            </td>
            <td style={{ textAlign: "center" }}>
              <button onClick={handleAllocationValue} style={{ width: "70%" }}>Allocation Val</button>
            </td>
            <td className="variance" style={{ textAlign: "center" }}>
              {variance !== null ? `${variance.toFixed(2)}%` : '-'}
            </td>
          </tr>
        ))}
    </>
  );
};

const Table = () => {
  const initialData = [
    {
      id: 'electronics',
      label: 'Electronics',
      value: 1500,
      originalValue: 1500,
      children: [
        { id: 'phones', label: 'Phones', value: 800, originalValue: 800, variance: null },
        { id: 'laptops', label: 'Laptops', value: 700, originalValue: 700, variance: null },
      ],
    },
    {
      id: 'furniture',
      label: 'Furniture',
      value: 1000,
      originalValue: 1000,
      children: [
        { id: 'tables', label: 'Tables', value: 300, originalValue: 300, variance: null },
        { id: 'chairs', label: 'Chairs', value: 700, originalValue: 700, variance: null },
      ],
    },
  ];

  const [data, setData] = useState(initialData);
  const [inputValues, setInputValues] = useState({});  // Initialize a state to track input values

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
  };

  // Function to update parent value (distribute value to children proportionally)
  const updateParentValue = (id, newParentValue) => {
    const updatedData = data.map((row) => {
      if (row.id === id) {
        const totalChildrenValue = row.children.reduce((sum, child) => sum + child.value, 0);

        if (newParentValue !== undefined) {
          row.value = newParentValue;
        } else {
          row.value = totalChildrenValue;
        }

        row.children = row.children.map((child) => {
          const childProportion = child.value / totalChildrenValue;
          const newChildValue = row.value * childProportion;
          child.value = newChildValue;
          child.variance = calculateVariance(child.originalValue, child.value);
          return child;
        });

        row.variance = calculateVariance(row.originalValue, row.value);
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
      <table style={{ fontFamily: "monospace" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>Label</th>
            <th style={{ textAlign: "center" }}>Value</th>
            <th style={{ textAlign: "center" }}>Input</th>
            <th style={{ textAlign: "center" }}>Allocation %</th>
            <th style={{ textAlign: "center" }}>Allocation Val</th>
            <th style={{ textAlign: "center" }}>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <Row
              key={row.id}
              row={row}
              updateRowValue={updateRowValue}
              updateParentValue={updateParentValue}
              isParent={true}
              inputValues={inputValues}
              setInputValues={setInputValues}
            />
          ))}
          <tr>
            <td style={{ textAlign: "center" }}>Grand Total</td>
            <td colSpan="5" style={{ paddingLeft: "3vw", fontSize: "3vh" }}>{calculateGrandTotal()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
