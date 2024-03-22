import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function FetchData() {
 const [data, setData] = useState(null);
 const [filteredResults, setFilteredResults] = useState([]);
 const [searchInput, setSearchInput] = useState('');
 const [editingPartNum, setEditingPartNum] = useState(null);
 const [editingDescription, setEditingDescription] = useState('');
 const apilink = 'https://77.92.189.102/iit_vertical_precast/api/v1/Erp.BO.PartSvc/Parts';
 const username = 'manager';
 const password = 'manager';

 useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apilink, {
          auth: {
            username: username,
            password: password
          }
        });
        setData(response.data);
        setFilteredResults(response.data.value);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
 }, [apilink]);

 const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    if (searchValue !== '') {
      const filteredData = data.value.filter((item) => {
        return item.PartNum.toLowerCase().includes(searchValue.toLowerCase());
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(data.value);
    }
 };

 const handleEdit = (partNum) => {
    setEditingPartNum(partNum);
    const part = data.value.find(item => item.PartNum === partNum);
    setEditingDescription(part.PartDescription);
 };

 const handleSave = async (partNum) => {
    const updateUrl = `${apilink}/('EPIC06',${partNum})`;

    try {
        const response = await axios.patch(updateUrl, {
            PartDescription: editingDescription
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: username,
                password: password
            }
        });

        if (response.status === 200) {
            const updatedPart = response.data;
            const updatedData = data.value.map(item => item.PartNum === partNum ? updatedPart : item);
            setData({ ...data, value: updatedData });
            setFilteredResults(updatedData);
            setEditingPartNum(null);
        } else {
            console.error('Error updating part description:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating part description:', error);
    }
};

 return (
    <div className='container'>
      <h1>Part Master Screen</h1>
      <input className='form-control'
        type="text"
        placeholder="Search PartNum..."
        onChange={(e) => searchItems(e.target.value)}
      />
      {filteredResults ? (
        <table className='table'>
          <thead>
            <tr>
              <th>Company</th>
              <th>PartNum</th>
              <th>PartDescription</th>
              <th>ClassID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((part, index) => (
              <tr key={index}>
                <td>{part.Company}</td>
                <td>{part.PartNum}</td>
                <td>
                 {editingPartNum === part.PartNum ? (
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                    />
                 ) : (
                    part.PartDescription
                 )}
                </td>
                <td>{part.ClassID}</td>
                <td>
                 {editingPartNum === part.PartNum ? (
                    <button className='btn btn-info' onClick={() => handleSave(part.PartNum)} >Save</button>
                 ) : (
                    <button className='btn btn-warning' onClick={() => handleEdit(part.PartNum)}>Edit</button>
                 )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
 );
}

export default FetchData;
