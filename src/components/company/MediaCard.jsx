import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function MediaCard({ data }) {
  return (
    <Card
      sx={{
        maxWidth: 500,
        padding: "1rem",
        borderStyle: "solid",
        borderSpacing: "1rem",
        borderColor: "#03045e",
        borderRadius: "15px",
        marginTop: "0.5rem",
        borderWidth: "0.10rem",
        background: "#dbe9ee",
        width: 500,
      }}
    >
      <CardMedia
        sx={{ height: 140 }}
        image={data.image_url}
        title={data.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {data.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" href={data.article_url} target="_blank">
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
