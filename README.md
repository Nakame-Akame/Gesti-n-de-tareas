TaskFlow es una aplicación web de gestión de tareas desarrollada con HTML5, CSS3 y JavaScript Vanilla. Su objetivo principal es permitir a los usuarios organizar tareas de manera eficiente mediante una interfaz moderna, responsive e intuitiva. La aplicación incluye funcionalidades como creación de tareas, prioridades, filtros, estadísticas de progreso, búsqueda en tiempo real y persistencia de datos usando LocalStorage.

La aplicación permite agregar nuevas tareas escribiendo un nombre y seleccionando una prioridad entre Alta, Media o Baja. Cada tarea se almacena como un objeto dentro de un array y contiene información como identificador único, nombre, prioridad, estado y fecha de creación. Las tareas pueden marcarse como completadas o pendientes, lo que actualiza automáticamente la interfaz visual y las estadísticas generales.

Uno de los aspectos principales del proyecto es la persistencia de datos mediante LocalStorage. Esto permite que las tareas permanezcan guardadas incluso después de cerrar o recargar el navegador. Además de las tareas, también se almacena la configuración del tema visual seleccionado por el usuario.

La interfaz incorpora un sistema de filtros que permite visualizar únicamente tareas pendientes, completadas o todas las tareas registradas. También se implementa un buscador dinámico que filtra las tareas en tiempo real conforme el usuario escribe en el campo de búsqueda.

El dashboard de estadísticas muestra información importante sobre el progreso del usuario, incluyendo el número total de tareas creadas, la cantidad de tareas completadas, el porcentaje de avance y el número de tareas de prioridad alta. Estas estadísticas se actualizan automáticamente cada vez que ocurre un cambio en la lista de tareas.

El diseño visual fue construido utilizando variables CSS para facilitar la personalización y el mantenimiento del código. Se implementó un sistema de tema oscuro y claro mediante atributos personalizados (data-theme) y variables globales. La interfaz utiliza Flexbox, CSS Grid y Media Queries para garantizar compatibilidad en computadoras, tablets y dispositivos móviles.

La estructura del proyecto está organizada de manera simple y modular, utilizando archivos separados para HTML, CSS y JavaScript. El archivo HTML contiene la estructura principal de la aplicación, el archivo CSS controla toda la apariencia visual y las animaciones, mientras que JavaScript administra la lógica de tareas, renderizado dinámico, filtros, estadísticas y almacenamiento local.

El proyecto también promueve buenas prácticas de desarrollo colaborativo utilizando Git y GitHub. Se recomienda trabajar con ramas separadas para cada funcionalidad, realizar commits descriptivos y utilizar Pull Requests antes de fusionar cambios en la rama principal. Asimismo, se sugiere utilizar GitHub Projects para organizar el flujo de trabajo mediante un tablero Kanban.

Finalmente, la aplicación puede desplegarse fácilmente usando GitHub Pages, permitiendo acceder al proyecto desde cualquier navegador mediante una URL pública.