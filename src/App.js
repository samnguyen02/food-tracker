import React, { useState } from 'react';
import './FoodTracker.css';

const FoodTracker = () => {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState('');
  const [currentFood, setCurrentFood] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pickerMode, setPickerMode] = useState('discover'); // 'discover' or 'favorites'

  const pickRandomFood = () => {
    if (pickerMode === 'discover') {
      // DISCOVER MODE: Pick from unrated foods only
      const unratedFoods = foods.filter(food => !food.rating);
      
      if (unratedFoods.length === 0) {
        alert("You've tried all your food ideas! Add more to continue the adventure 🎉");
        return;
      }
      
      setIsSpinning(true);
      setCurrentFood(null);
      setShowRating(false);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * unratedFoods.length);
        const selectedFood = unratedFoods[randomIndex];
        setCurrentFood(selectedFood);
        setIsSpinning(false);
        setShowRating(true);
      }, 2000);
      
    } else {
      // FAVORITES MODE: Pick from rated foods with weighting
      const ratedFoods = foods.filter(food => food.rating);
      
      if (ratedFoods.length === 0) {
        alert("No rated foods yet! Try the Discover mode first to build your favorites 🌟");
        return;
      }
      
      setIsSpinning(true);
      setCurrentFood(null);
      setShowRating(false);
      
      setTimeout(() => {
        // Build weighted array based on ratings
        const weightedFoods = [];
        ratedFoods.forEach(food => {
          const weight = food.rating || 1;
          for (let i = 0; i < weight; i++) {
            weightedFoods.push(food);
          }
        });
        
        const randomIndex = Math.floor(Math.random() * weightedFoods.length);
        const selectedFood = weightedFoods[randomIndex];
        setCurrentFood(selectedFood);
        setIsSpinning(false);
        // Don't show rating in favorites mode - already rated!
        setShowRating(false);
      }, 2000);
    }
  };

  const addFood = () => {
    if (newFood.trim()) {
      const food = {
        id: Date.now(),
        name: newFood.trim(),
        rating: null,
        weight: 1,
        dateAdded: new Date().toLocaleDateString(),
        tried: false
      };
      setFoods([...foods, food]);
      setNewFood('');
      setShowAddForm(false);
    }
  };

  const rateFood = (rating) => {
    if (currentFood) {
      setFoods(foods.map(food => 
        food.id === currentFood.id 
          ? { ...food, rating: rating, weight: rating, tried: true }
          : food
      ));
      setShowRating(false);
      setCurrentFood(null);
    }
  };

  const deleteFood = (id) => {
    setFoods(foods.filter(food => food.id !== id));
  };

  const toggleTried = (id) => {
    setFoods(foods.map(food => 
      food.id === id ? { ...food, tried: !food.tried } : food
    ));
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 0 || food.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const stats = {
    total: foods.length,
    tried: foods.filter(f => f.tried).length,
    avgRating: foods.filter(f => f.rating).length > 0 
      ? (foods.filter(f => f.rating).reduce((sum, f) => sum + f.rating, 0) / foods.filter(f => f.rating).length).toFixed(1)
      : 'N/A'
  };

  return (
    <div className="app-container">
      <div className="main-card">
        
        {/* Header */}
        <div className="header">
          <h1 className="title">🍔 Food Adventure Tracker</h1>
          <p className="subtitle">
            Save those TikTok food ideas and let fate decide your next meal!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Ideas</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.tried}</div>
            <div className="stat-label">Tried</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.avgRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>

        <div className="content">
          
          {/* Mode Selector */}
          <div className="mode-selector">
            <h3 className="mode-title">Choose Your Adventure</h3>
            <div className="mode-buttons">
              <button
                onClick={() => setPickerMode('discover')}
                className={`mode-button ${pickerMode === 'discover' ? 'active' : ''}`}
              >
                <div className="mode-icon">🔍</div>
                <div className="mode-name">Discover Mode</div>
                <div className="mode-description">Try new unrated foods</div>
                <div className="mode-count">({foods.filter(f => !f.rating).length} foods)</div>
              </button>
              
              <button
                onClick={() => setPickerMode('favorites')}
                className={`mode-button ${pickerMode === 'favorites' ? 'active' : ''}`}
              >
                <div className="mode-icon">⭐</div>
                <div className="mode-name">Favorites Mode</div>
                <div className="mode-description">Revisit rated favorites</div>
                <div className="mode-count">({foods.filter(f => f.rating).length} foods)</div>
              </button>
            </div>
          </div>
          
          {/* Random Food Picker */}
          <div className="picker-section">
            <button
              onClick={pickRandomFood}
              disabled={(pickerMode === 'discover' && foods.filter(f => !f.rating).length === 0) || 
                       (pickerMode === 'favorites' && foods.filter(f => f.rating).length === 0) || 
                       isSpinning}
              className={`picker-button ${isSpinning ? 'spinning' : ''} ${
                (pickerMode === 'discover' && foods.filter(f => !f.rating).length === 0) || 
                (pickerMode === 'favorites' && foods.filter(f => f.rating).length === 0) ? 'disabled' : ''
              }`}
            >
              {isSpinning ? '🎲 Spinning...' : 
               pickerMode === 'discover' ? '🔍 Discover New Food!' : '⭐ Pick From Favorites!'}
            </button>
            <p className="picker-mode-info">
              {pickerMode === 'discover' ? 
                'Finding you something new to try...' : 
                'Higher rated foods are more likely to be selected!'}
            </p>
          </div>

          {/* Current Food Display */}
          {currentFood && (
            <div className="current-food">
              <h3 className="current-food-label">
                {pickerMode === 'discover' ? '🎉 Your Food Adventure:' : '⭐ From Your Favorites:'}
              </h3>
              <h2 className="current-food-name">{currentFood.name}</h2>
              
              {pickerMode === 'favorites' && currentFood.rating && (
                <div className="current-food-rating">
                  <p>Your previous rating: {'⭐'.repeat(currentFood.rating)} ({currentFood.rating}/5)</p>
                </div>
              )}
              
              {showRating && pickerMode === 'discover' && (
                <div className="rating-section">
                  <p className="rating-prompt">How was it? Rate your experience!</p>
                  <div className="rating-buttons">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => rateFood(rating)}
                        className="rating-button"
                      >
                        {'⭐'.repeat(rating)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {pickerMode === 'favorites' && (
                <div className="favorites-actions">
                  <p>Enjoy your favorite! 😋</p>
                  <button 
                    onClick={() => setCurrentFood(null)}
                    className="close-button"
                  >
                    Pick Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Food Section */}
          <div className="add-section">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="add-toggle-button"
              >
                ➕ Add New Food Idea from TikTok
              </button>
            ) : (
              <div className="add-form">
                <h3 className="add-form-title">Add Your Food Discovery 🔍</h3>
                <div className="add-form-inputs">
                  <input
                    type="text"
                    value={newFood}
                    onChange={(e) => setNewFood(e.target.value)}
                    placeholder="e.g., Korean corn dogs, Dubai chocolate bar..."
                    onKeyPress={(e) => e.key === 'Enter' && addFood()}
                    className="add-input"
                  />
                  <button onClick={addFood} className="add-button">
                    Add
                  </button>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="🔍 Search your food ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
              <option value={3}>⭐⭐⭐ (3 stars)</option>
              <option value={2}>⭐⭐ (2 stars)</option>
              <option value={1}>⭐ (1 star)</option>
            </select>
          </div>

          {/* Food List */}
          <div className="food-list-section">
            <h3 className="food-list-title">
              Your Food Collection ({filteredFoods.length})
            </h3>
            
            {filteredFoods.length === 0 ? (
              <div className="empty-state">
                {foods.length === 0 ? (
                  <>
                    <div className="empty-icon">🍽️</div>
                    <p>No food ideas yet!</p>
                    <p className="empty-subtitle">Start by adding some delicious discoveries from TikTok</p>
                  </>
                ) : (
                  <>
                    <div className="empty-icon">🔍</div>
                    <p>No foods match your search</p>
                  </>
                )}
              </div>
            ) : (
              <div className="food-list">
                {filteredFoods.map(food => (
                  <div 
                    key={food.id}
                    className={`food-item ${food.tried ? 'tried' : ''}`}
                  >
                    <button
                      onClick={() => toggleTried(food.id)}
                      className={`checkbox ${food.tried ? 'checked' : ''}`}
                    >
                      {food.tried ? '✓' : ''}
                    </button>
                    
                    <div className="food-details">
                      <div className={`food-name ${food.tried ? 'completed' : ''}`}>
                        {food.name}
                      </div>
                      
                      <div className="food-meta">
                        {food.rating && (
                          <div className="food-rating">
                            <span>{'⭐'.repeat(food.rating)}</span>
                            <span className="rating-text">({food.rating}/5)</span>
                          </div>
                        )}
                        <span className="food-date">Added {food.dateAdded}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteFood(food.id)}
                      className="delete-button"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodTracker;