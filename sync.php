<?php

if(!empty($_POST['dados'])) {

    $dado = "Hora do disparo: ".$_POST['dados'];

    $arquivo = fopen("sync.txt", "a") or die("Unable to open file!");
    fwrite($arquivo, "\n". $dado);
    fclose($arquivo);

    echo "Gravado com sucesso!";

}else{
    echo "Sem dados para gravar!";
}

?>