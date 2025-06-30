import React, { useEffect, useRef, useState } from 'react';

interface GameOfLifeProps {
  isActive: boolean;
  className?: string;
  cellSize?: number;
  speed?: number;
  opacity?: number;
  glowColor?: string;
}

export function GameOfLife({ 
  isActive, 
  className = '', 
  cellSize = 8, 
  speed = 150,
  opacity = 0.3,
  glowColor = '#f97316'
}: GameOfLifeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gridRef = useRef<boolean[][]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, cols: 0, rows: 0 });

  // Initialize grid with random pattern
  const initializeGrid = (cols: number, rows: number) => {
    const grid: boolean[][] = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        // Create interesting patterns - not completely random
        if (Math.random() < 0.15) {
          grid[i][j] = true;
        } else {
          grid[i][j] = false;
        }
      }
    }
    
    // Add some classic patterns for more interesting evolution
    addGliderPattern(grid, cols, rows);
    addOscillatorPatterns(grid, cols, rows);
    
    return grid;
  };

  // Add glider patterns for movement
  const addGliderPattern = (grid: boolean[][], cols: number, rows: number) => {
    const gliders = [
      // Classic glider pattern
      [[false, true, false], [false, false, true], [true, true, true]],
      // Another glider
      [[true, false, true], [false, true, true], [false, true, false]]
    ];

    for (let g = 0; g < 3; g++) {
      const glider = gliders[g % gliders.length];
      const startRow = Math.floor(Math.random() * (rows - 10)) + 5;
      const startCol = Math.floor(Math.random() * (cols - 10)) + 5;
      
      for (let i = 0; i < glider.length; i++) {
        for (let j = 0; j < glider[i].length; j++) {
          if (startRow + i < rows && startCol + j < cols) {
            grid[startRow + i][startCol + j] = glider[i][j];
          }
        }
      }
    }
  };

  // Add oscillator patterns
  const addOscillatorPatterns = (grid: boolean[][], cols: number, rows: number) => {
    // Blinker patterns
    for (let b = 0; b < 5; b++) {
      const row = Math.floor(Math.random() * (rows - 5)) + 2;
      const col = Math.floor(Math.random() * (cols - 5)) + 2;
      
      if (Math.random() < 0.5) {
        // Horizontal blinker
        grid[row][col] = true;
        grid[row][col + 1] = true;
        grid[row][col + 2] = true;
      } else {
        // Vertical blinker
        grid[row][col] = true;
        grid[row + 1][col] = true;
        grid[row + 2][col] = true;
      }
    }
  };

  // Count living neighbors
  const countNeighbors = (grid: boolean[][], row: number, col: number, rows: number, cols: number) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        
        const newRow = row + i;
        const newCol = col + j;
        
        // Wrap around edges for infinite effect
        const wrappedRow = ((newRow % rows) + rows) % rows;
        const wrappedCol = ((newCol % cols) + cols) % cols;
        
        if (grid[wrappedRow][wrappedCol]) {
          count++;
        }
      }
    }
    return count;
  };

  // Apply Conway's Game of Life rules
  const nextGeneration = (currentGrid: boolean[][], rows: number, cols: number) => {
    const newGrid: boolean[][] = [];
    
    for (let i = 0; i < rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < cols; j++) {
        const neighbors = countNeighbors(currentGrid, i, j, rows, cols);
        const isAlive = currentGrid[i][j];
        
        if (isAlive) {
          // Live cell with 2 or 3 neighbors survives
          newGrid[i][j] = neighbors === 2 || neighbors === 3;
        } else {
          // Dead cell with exactly 3 neighbors becomes alive
          newGrid[i][j] = neighbors === 3;
        }
      }
    }
    
    return newGrid;
  };

  // Draw the grid
  const draw = (canvas: HTMLCanvasElement, grid: boolean[][], cols: number, rows: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up glow effect
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 3;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j]) {
          const x = j * cellSize;
          const y = i * cellSize;
          
          // Create gradient for each cell
          const gradient = ctx.createRadialGradient(
            x + cellSize/2, y + cellSize/2, 0,
            x + cellSize/2, y + cellSize/2, cellSize/2
          );
          
          gradient.addColorStop(0, `${glowColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${glowColor}20`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        }
      }
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const { cols, rows } = dimensions;
    if (cols === 0 || rows === 0) return;

    // Draw current generation
    draw(canvas, gridRef.current, cols, rows);
    
    // Calculate next generation
    gridRef.current = nextGeneration(gridRef.current, rows, cols);
    
    // Schedule next frame
    animationRef.current = setTimeout(() => {
      requestAnimationFrame(animate);
    }, speed);
  };

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);

      canvas.width = width;
      canvas.height = height;

      setDimensions({ width, height, cols, rows });
      
      // Initialize grid when dimensions change
      if (cols > 0 && rows > 0) {
        gridRef.current = initializeGrid(cols, rows);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [cellSize]);

  // Start/stop animation
  useEffect(() => {
    if (isActive && dimensions.cols > 0 && dimensions.rows > 0) {
      animate();
    } else if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isActive, dimensions, speed]);

  // Reinitialize when activated
  useEffect(() => {
    if (isActive && dimensions.cols > 0 && dimensions.rows > 0) {
      gridRef.current = initializeGrid(dimensions.cols, dimensions.rows);
    }
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        opacity: isActive ? opacity : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  );
}