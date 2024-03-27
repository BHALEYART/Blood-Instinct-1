document.addEventListener('DOMContentLoaded', function() {
    const panelImages = [
        'cover1.jpg',
        'panel1.jpg',
        'panel2.jpg',
        'panel3.jpg',
        'panel4.jpg',
        'panel5.jpg',
        'panel6.jpg',
        'panel7.jpg',
        'panel8.jpg',
        'panel9.jpg',
        'panel10.jpg',
        'panel11.jpg',
        'panel12.jpg',
        'panel13.jpg',
        'panel14.jpg',
        'panel15.jpg',
        'panel16.jpg',
        'panel17.jpg',
        'panel18.jpg',
        'panel19.jpg',
        'panel20.jpg'
        // Add more panel images as needed
      ];
  
    let currentIndex = 0;
    const panelImg = document.querySelector('.panel-img');
    const panelNameElem = document.querySelector('.panel-name');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
  
    function showPanel(index) {
      panelImg.src = panelImages[index];
      const panelName = panelImages[index].split('.')[0]; // Extracting panel name without extension
      panelNameElem.textContent = panelName;
    }
  
    showPanel(currentIndex);
  
    prevBtn.addEventListener('click', function() {
      if (currentIndex === 0) {
        currentIndex = panelImages.length - 1;
      } else {
        currentIndex--;
      }
      showPanel(currentIndex);
    });
  
    nextBtn.addEventListener('click', function() {
      if (currentIndex === panelImages.length - 1) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      showPanel(currentIndex);
    });
  });
  