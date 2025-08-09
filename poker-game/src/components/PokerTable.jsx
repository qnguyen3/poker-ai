import React, { useRef, useEffect, useState } from 'react';

const PokerTable = ({ gameState, onCanvasReady }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const animationFrameRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        setDimensions({
          width: Math.min(width - 40, 1200),
          height: Math.min(height - 40, 700)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    if (onCanvasReady) {
      onCanvasReady(ctx, canvas);
    }

    const drawTable = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const tableWidth = canvas.width * 0.7;
      const tableHeight = canvas.height * 0.6;

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.ellipse(0, 0, tableWidth / 2 + 15, tableHeight / 2 + 15, 0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#35654d';
      ctx.beginPath();
      ctx.ellipse(0, 0, tableWidth / 2, tableHeight / 2, 0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, tableWidth / 2 - 10, tableHeight / 2 - 10, 0, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    };

    const drawPot = () => {
      if (!gameState || gameState.pot === 0) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY - 50);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(-60, -20, 120, 40);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(-60, -20, 120, 40);

      ctx.fillStyle = '#333';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Pot: $${gameState.pot}`, 0, 0);

      ctx.restore();
    };

    const drawCommunityCards = () => {
      if (!gameState || !gameState.communityCards) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cardSpacing = 80;
      const startX = centerX - (gameState.communityCards.length - 1) * cardSpacing / 2;

      gameState.communityCards.forEach((card, index) => {
        if (card) {
          card.setPosition(startX + index * cardSpacing, centerY);
          card.draw(ctx);
        }
      });
    };

    const drawPlayerArea = (player, position) => {
      if (!player) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      let x, y;

      if (position === 'bottom') {
        x = centerX;
        y = canvas.height - 120;
      } else {
        x = centerX;
        y = 120;
      }

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = player.isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-100, -40, 200, 80);
      ctx.strokeStyle = player.isActive ? '#3b82f6' : '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(-100, -40, 200, 80);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, 0, -20);
      
      ctx.font = '12px Arial';
      ctx.fillText(`$${player.chips}`, 0, 0);

      if (player.lastAction) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'italic 12px Arial';
        ctx.fillText(player.lastAction, 0, 20);
      }

      ctx.restore();

      const cardStartX = x - 35;
      if (player.hand) {
        player.hand.forEach((card, index) => {
          if (card) {
            card.setPosition(cardStartX + index * 70, y);
            card.draw(ctx);
          }
        });
      }
    };

    const drawDealerButton = () => {
      if (!gameState || gameState.dealerPosition === undefined) return;

      const centerX = canvas.width / 2;
      const positions = [
        { x: centerX, y: canvas.height - 180 },
        { x: centerX, y: 180 }
      ];

      const pos = positions[gameState.dealerPosition];
      
      ctx.save();
      ctx.translate(pos.x + 120, pos.y);

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', 0, 0);

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawTable();
      drawPot();
      drawCommunityCards();
      
      if (gameState) {
        if (gameState.player) {
          drawPlayerArea(gameState.player, 'bottom');
        }
        if (gameState.opponent) {
          drawPlayerArea(gameState.opponent, 'top');
        }
      }
      
      drawDealerButton();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, dimensions, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="block mx-auto rounded-lg shadow-2xl"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
};

export default PokerTable;