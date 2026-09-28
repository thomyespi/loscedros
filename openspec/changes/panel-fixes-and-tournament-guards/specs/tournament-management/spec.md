## MODIFIED Requirements

### Requirement: Estados del torneo
Un torneo SHALL tener uno de estos estados: `borrador`, `proximo`, `en_curso` o `finalizado`, que el admin cambia manualmente. Los torneos en `borrador` MUST NOT ser visibles al público.

Para pasar a `en_curso` desde `borrador` o `proximo`, la Fecha 1 MUST tener al menos un cruce armado. Una vez en juego, los cruces SHALL poder editarse, agregarse o quitarse libremente.

Para pasar a `finalizado`, todas las fechas del torneo MUST tener al menos un cruce y todos sus cruces MUST tener los 3 resultados cargados. No existe la opción de finalizar con resultados incompletos. Al finalizar, el sistema SHALL calcular y guardar el campeón (el primero de la tabla).

Cuando una transición no está permitida, el panel SHALL mostrar el botón deshabilitado junto con el motivo y un acceso a la fecha a completar. Estas reglas MUST validarse también en el servidor y en la base de datos, y solo se evalúan al cambiar de estado (no afectan a torneos que ya están en ese estado).

Un torneo finalizado SHALL poder reabrirse (volver a `en_curso`), lo que borra el campeón guardado.

#### Scenario: Publicar torneo
- **WHEN** el admin cambia un torneo de `borrador` a `proximo`
- **THEN** el torneo aparece en la sección pública de torneos

#### Scenario: Arrancar sin cruces
- **WHEN** el admin intenta pasar a `en_curso` un torneo cuya Fecha 1 no tiene cruces
- **THEN** el botón "Arrancar torneo" está deshabilitado con el mensaje "Armá los cruces de la Fecha 1 para arrancar" y el servidor rechaza el cambio si igual se intenta

#### Scenario: Arrancar con la Fecha 1 armada
- **WHEN** la Fecha 1 tiene al menos un cruce y las demás fechas todavía no tienen ninguno
- **THEN** el admin puede pasar el torneo a `en_curso`

#### Scenario: Editar cruces con el torneo en juego
- **WHEN** el torneo está `en_curso` y el admin borra o cambia un cruce sin resultados
- **THEN** el cambio se guarda sin que el estado del torneo lo impida

#### Scenario: Finalizar con resultados incompletos
- **WHEN** el admin intenta finalizar un torneo con algún cruce al que le faltan resultados
- **THEN** el botón "Finalizar torneo" está deshabilitado e indica qué fecha y cuántos cruces faltan, y el servidor rechaza el cambio si igual se intenta

#### Scenario: Finalizar con una fecha sin cruces
- **WHEN** el admin intenta finalizar un torneo en el que alguna fecha no tiene cruces
- **THEN** el sistema no permite finalizar e indica qué fecha está vacía

#### Scenario: Campeón guardado
- **WHEN** el admin finaliza un torneo con todas las fechas completas
- **THEN** el equipo primero en la tabla queda registrado como campeón y suma un título en el ranking histórico

#### Scenario: Reabrir torneo finalizado
- **WHEN** el admin reabre un torneo finalizado
- **THEN** vuelve a `en_curso` y se borra el campeón guardado
